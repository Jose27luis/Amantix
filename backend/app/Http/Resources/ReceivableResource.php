<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BillingInvoice;
use App\Models\PaymentApplication;
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
            'monto_pagado' => (float) $cuenta->monto_pagado,
            'saldo' => $cuenta->saldo(),
            'vence' => $cuenta->vence?->toDateString(),
            'vencida' => $cuenta->estado->cobrable() && $cuenta->vence !== null && $cuenta->vence->isBefore(today()),
            'estado' => $cuenta->estado->value,
            'origen' => $cuenta->origen,
            'pagada_at' => $cuenta->pagada_at?->toIso8601String(),
            'motivo_anulacion' => $cuenta->motivo_anulacion,
            'aplicaciones' => $cuenta->relationLoaded('aplicaciones')
                ? $cuenta->aplicaciones->map(fn (PaymentApplication $aplicacion): array => [
                    'pago_id' => $aplicacion->pago_id,
                    'monto' => (float) $aplicacion->monto,
                    'fecha' => $aplicacion->created_at?->toIso8601String(),
                    'comprobante' => $aplicacion->relationLoaded('pago') && $aplicacion->pago?->comprobante instanceof BillingInvoice
                        ? ComprobanteResource::datos($aplicacion->pago->comprobante, $request)
                        : null,
                ])->values()->all()
                : [],
        ];
    }
}
