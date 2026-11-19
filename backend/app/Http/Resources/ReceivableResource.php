<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BillingInvoice;
use App\Models\PaymentReport;
use App\Models\Receivable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceivableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cuenta = $this->resource;

        if (! $cuenta instanceof Receivable) {
            return [];
        }

        return [
            'id' => $cuenta->id,
            'empresa' => $cuenta->relationLoaded('empresa') && $cuenta->empresa !== null ? [
                'id' => $cuenta->empresa->id,
                'razon_social' => $cuenta->empresa->razon_social,
                'ruc' => $cuenta->empresa->ruc,
                'telefono' => $cuenta->empresa->telefono,
            ] : null,
            'producto' => $cuenta->relationLoaded('suscripcion') ? $cuenta->suscripcion?->producto?->nombre : null,
            'concepto' => $cuenta->concepto,
            'periodo_inicio' => $cuenta->periodo_inicio?->toDateString(),
            'periodo_fin' => $cuenta->periodo_fin?->toDateString(),
            'monto' => (float) $cuenta->monto,
            'vence' => $cuenta->vence?->toDateString(),
            'vencida' => $cuenta->estado->cobrable() && $cuenta->vence !== null && $cuenta->vence->isBefore(today()),
            'estado' => $cuenta->estado->value,
            'origen' => $cuenta->origen,
            'pagada_at' => $cuenta->pagada_at?->toIso8601String(),
            'motivo_anulacion' => $cuenta->motivo_anulacion,
            'pagos' => $cuenta->relationLoaded('pagos')
                ? $cuenta->pagos->map(fn (PaymentReport $pago): array => PaymentReportResource::make($pago)->resolve($request))->all()
                : [],
            'comprobante' => $cuenta->relationLoaded('comprobante') && $cuenta->comprobante instanceof BillingInvoice ? [
                'tipo' => $cuenta->comprobante->tipo,
                'numero' => $cuenta->comprobante->numero,
                'estado' => $cuenta->comprobante->estado,
                'estado_sunat' => $cuenta->comprobante->estado_sunat,
                'pdf_url' => $cuenta->comprobante->pdf_url,
                'error' => $request->user()?->esAdministrador() === true ? $cuenta->comprobante->error : null,
            ] : null,
        ];
    }
}
