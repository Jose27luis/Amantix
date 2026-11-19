<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $suscripcion = $this->resource;

        if (! $suscripcion instanceof Subscription) {
            return [];
        }

        return [
            'id' => $suscripcion->id,
            'empresa_id' => $suscripcion->empresa_id,
            'producto' => $suscripcion->producto === null ? null : [
                'id' => $suscripcion->producto->id,
                'nombre' => $suscripcion->producto->nombre,
                'url_produccion' => $suscripcion->producto->url_produccion,
            ],
            'plan' => $suscripcion->plan === null ? null : [
                'id' => $suscripcion->plan->id,
                'nombre' => $suscripcion->plan->nombre,
            ],
            'precio' => (float) $suscripcion->precio,
            'concepto' => $suscripcion->concepto,
            'cuenta_externa' => $suscripcion->cuenta_externa,
            'periodo' => $suscripcion->periodo->value,
            'fecha_alta' => $suscripcion->fecha_alta?->toDateString(),
            'proxima_renovacion' => $suscripcion->proxima_renovacion?->toDateString(),
            'estado' => $suscripcion->estado->value,
        ];
    }
}
