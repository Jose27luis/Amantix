<?php

declare(strict_types=1);

namespace App\Http\Resources;

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

        return [
            'id' => $pago->id,
            'cuenta_id' => $pago->cuenta_id,
            'monto' => (float) $pago->monto,
            'metodo' => $pago->metodo->value,
            'numero_operacion' => $pago->numero_operacion,
            'fecha_pago' => $pago->fecha_pago?->toDateString(),
            'tiene_captura' => $pago->captura_ruta !== null,
            'captura_es_imagen' => str_starts_with((string) $pago->captura_tipo, 'image/'),
            'origen' => $pago->origen,
            'estado' => $pago->estado->value,
            'motivo_rechazo' => $pago->motivo_rechazo,
            'reportado_por' => $pago->relationLoaded('reportadoPor') ? $pago->reportadoPor?->nombre : null,
            'revisado_por' => $pago->relationLoaded('revisadoPor') ? $pago->revisadoPor?->nombre : null,
            'revisado_at' => $pago->revisado_at?->toIso8601String(),
            'creado_at' => $pago->created_at?->toIso8601String(),
            'cuenta' => $pago->relationLoaded('cuenta') && $pago->cuenta !== null
                ? ReceivableResource::make($pago->cuenta)->resolve($request)
                : null,
        ];
    }
}
