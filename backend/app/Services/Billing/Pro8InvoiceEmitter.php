<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\BillingInvoice;
use App\Models\Company;
use App\Models\Receivable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class Pro8InvoiceEmitter
{
    private const AFECTACION_EXONERADA = '20';
    private const TIPO_OPERACION_VENTA = '0101';

    public function emitir(Receivable $cuenta): BillingInvoice
    {
        $cuenta->loadMissing(['empresa', 'suscripcion']);
        $empresa = $cuenta->empresa;
        $tipo = $this->tipo($empresa);

        $comprobante = BillingInvoice::query()->firstOrCreate(
            ['cuenta_id' => $cuenta->id],
            [
                'empresa_id' => $empresa->id,
                'tipo' => $tipo,
                'total' => $cuenta->monto,
                'estado' => BillingInvoice::ESTADO_PENDIENTE,
            ],
        );

        if ($comprobante->estado === BillingInvoice::ESTADO_EMITIDO) {
            return $comprobante;
        }

        $token = (string) config('services.pro8.token');
        if ($token === '') {
            return $this->fallo($comprobante, 'Falta configurar el token de pro8.');
        }

        try {
            $respuesta = Http::withToken($token)
                ->acceptJson()
                ->timeout(60)
                ->post(rtrim((string) config('services.pro8.url'), '/').'/api/documents', $this->cuerpo($cuenta, $empresa, $tipo));
        } catch (ConnectionException $error) {
            return $this->fallo($comprobante, 'pro8 no respondió: '.$error->getMessage());
        }

        $datos = $respuesta->json();
        if (! $respuesta->successful() || ! is_array($datos) || ($datos['success'] ?? false) !== true) {
            $mensaje = is_array($datos) ? (string) ($datos['message'] ?? $respuesta->body()) : $respuesta->body();

            return $this->fallo($comprobante, 'pro8 rechazó el comprobante: '.$mensaje);
        }

        $comprobante->fill([
            'tipo' => $tipo,
            'numero' => (string) ($datos['data']['number'] ?? ''),
            'external_id' => (string) ($datos['data']['external_id'] ?? ''),
            'estado_sunat' => (string) ($datos['data']['state_type_description'] ?? ''),
            'pdf_url' => (string) ($datos['links']['pdf'] ?? ''),
            'xml_url' => (string) ($datos['links']['xml'] ?? ''),
            'estado' => BillingInvoice::ESTADO_EMITIDO,
            'error' => null,
            'emitido_at' => now(),
        ])->save();

        return $comprobante;
    }

    private function fallo(BillingInvoice $comprobante, string $mensaje): BillingInvoice
    {
        $comprobante->fill([
            'estado' => BillingInvoice::ESTADO_ERROR,
            'error' => Str::limit($mensaje, 490),
        ])->save();

        return $comprobante;
    }

    private function tipo(Company $empresa): string
    {
        return strlen($empresa->ruc) === 11 ? BillingInvoice::TIPO_FACTURA : BillingInvoice::TIPO_BOLETA;
    }

    private function cuerpo(Receivable $cuenta, Company $empresa, string $tipo): array
    {
        $monto = round((float) $cuenta->monto, 2);
        $esFactura = $tipo === BillingInvoice::TIPO_FACTURA;
        $hoy = now();

        return [
            'idempotency_key' => 'amantix-cobranza-'.$cuenta->id.'-'.$cuenta->created_at?->timestamp,
            'serie_documento' => $esFactura ? config('services.pro8.serie_factura') : config('services.pro8.serie_boleta'),
            'numero_documento' => '#',
            'fecha_de_emision' => $hoy->toDateString(),
            'hora_de_emision' => $hoy->format('H:i:s'),
            'codigo_tipo_operacion' => self::TIPO_OPERACION_VENTA,
            'codigo_tipo_documento' => $tipo,
            'codigo_tipo_moneda' => 'PEN',
            'fecha_de_vencimiento' => $hoy->toDateString(),
            'datos_del_cliente_o_receptor' => [
                'codigo_tipo_documento_identidad' => $esFactura ? '6' : '1',
                'numero_documento' => $empresa->ruc,
                'apellidos_y_nombres_o_razon_social' => $empresa->razon_social,
                'codigo_pais' => 'PE',
                'direccion' => $empresa->direccion ?: '-',
                'correo_electronico' => $empresa->correo ?: '',
                'telefono' => $empresa->telefono ?: '',
            ],
            'totales' => [
                'total_exportacion' => 0,
                'total_operaciones_gravadas' => 0,
                'total_operaciones_inafectas' => 0,
                'total_operaciones_exoneradas' => $monto,
                'total_operaciones_gratuitas' => 0,
                'total_igv' => 0,
                'total_impuestos' => 0,
                'total_valor' => $monto,
                'total_venta' => $monto,
            ],
            'items' => [[
                'codigo_interno' => $cuenta->suscripcion_id !== null ? 'AMX-SUS-'.$cuenta->suscripcion?->producto_id : 'AMX-VARIOS',
                'descripcion' => $cuenta->concepto,
                'unidad_de_medida' => 'ZZ',
                'cantidad' => 1,
                'valor_unitario' => $monto,
                'codigo_tipo_precio' => '01',
                'precio_unitario' => $monto,
                'codigo_tipo_afectacion_igv' => self::AFECTACION_EXONERADA,
                'total_base_igv' => $monto,
                'porcentaje_igv' => 18,
                'total_igv' => 0,
                'total_impuestos' => 0,
                'total_valor_item' => $monto,
                'total_item' => $monto,
            ]],
        ];
    }
}
