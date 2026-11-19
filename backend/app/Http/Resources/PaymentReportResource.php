<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BillingInvoice;
use App\Models\PaymentApplication;
use App\Models\PaymentReport;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pago = $this->resource;

        if (! $pago instanceof PaymentReport) {
            return [];
        }

        $deuda = $pago->getAttribute('deuda_empresa');

        return [
            'id' => $pago->id,
            'cuenta_id' => $pago->cuenta_id,
            'empresa' => $pago->relationLoaded('empresa') && $pago->empresa !== null ? [
                'id' => $pago->empresa->id,
                'razon_social' => $pago->empresa->razon_social,
                'ruc' => $pago->empresa->ruc,
                'telefono' => $pago->empresa->telefono,
            ] : null,
            'deuda_empresa' => $deuda === null ? null : round((float) $deuda, 2),
            'monto' => (float) $pago->monto,
            'monto_reportado' => $pago->monto_reportado === null ? null : (float) $pago->monto_reportado,
            'metodo' => $pago->metodo->value,
            'metodo_nombre' => $pago->relationLoaded('metodoPago') ? $pago->metodoPago?->nombre : null,
            'numero_operacion' => $pago->numero_operacion,
            'fecha_pago' => $pago->fecha_pago?->toDateString(),
            'tiene_captura' => $pago->captura_ruta !== null,
            'captura_es_imagen' => str_starts_with((string) $pago->captura_tipo, 'image/'),
            'origen' => $pago->origen,
            'estado' => $pago->estado->value,
            'motivo_rechazo' => $pago->motivo_rechazo,
            'reportado_por' => $pago->relationLoaded('reportadoPor') && $pago->reportadoPor !== null
                ? $pago->reportadoPor->nombre
                : $pago->reportado_nombre,
            'revisado_por' => $pago->relationLoaded('revisadoPor') ? $pago->revisadoPor?->nombre : null,
            'revisado_at' => $pago->revisado_at?->toIso8601String(),
            'creado_at' => $pago->created_at?->toIso8601String(),
            'cuenta' => $pago->relationLoaded('cuenta') && $pago->cuenta !== null
                ? ['id' => $pago->cuenta->id, 'concepto' => $pago->cuenta->concepto, 'saldo' => $pago->cuenta->saldo()]
                : null,
            'aplicaciones' => $pago->relationLoaded('aplicaciones')
                ? $pago->aplicaciones->map(fn (PaymentApplication $aplicacion): array => [
                    'cuenta_id' => $aplicacion->cuenta_id,
                    'concepto' => $aplicacion->relationLoaded('cuenta') ? $aplicacion->cuenta?->concepto : null,
                    'monto' => (float) $aplicacion->monto,
                ])->values()->all()
                : [],
            'comprobante' => $pago->relationLoaded('comprobante') && $pago->comprobante instanceof BillingInvoice
                ? ComprobanteResource::datos($pago->comprobante, $request)
                : null,
        ];
    }
}
