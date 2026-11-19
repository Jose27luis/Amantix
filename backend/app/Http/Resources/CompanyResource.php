<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\SubscriptionStatus;
use App\Models\Company;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $empresa = $this->resource;

        if (! $empresa instanceof Company) {
            return [];
        }

        $proxima = $empresa->getAttribute('proxima_renovacion');
        $deuda = $empresa->getAttribute('deuda');
        $suscripciones = $empresa->relationLoaded('suscripciones') ? $empresa->suscripciones : null;

        return [
            'id' => $empresa->id,
            'razon_social' => $empresa->razon_social,
            'ruc' => $empresa->ruc,
            'rubro' => $empresa->rubro,
            'direccion' => $empresa->direccion,
            'contacto' => $empresa->contacto,
            'telefono' => $empresa->telefono,
            'correo' => $empresa->correo,
            'suscripciones_activas' => $empresa->getAttribute('suscripciones_activas'),
            'tickets_abiertos' => $empresa->getAttribute('tickets_abiertos'),
            'proxima_renovacion' => is_string($proxima) ? substr($proxima, 0, 10) : null,
            'deuda' => $deuda === null ? null : round((float) $deuda, 2),
            'cuentas_vencidas' => $empresa->getAttribute('cuentas_vencidas'),
            'usuarios_portal' => $empresa->getAttribute('usuarios_portal'),
            'monto_mensual' => $suscripciones === null ? null : round((float) $suscripciones
                ->filter(fn (Subscription $s): bool => $s->estado === SubscriptionStatus::Activa)
                ->sum(fn (Subscription $s): float => $s->montoMensual()), 2),
            'productos' => $suscripciones === null ? null : $suscripciones->map(fn (Subscription $s): array => [
                'nombre' => $s->producto?->nombre ?? 'Producto',
                'estado' => $s->estado->value,
                'precio' => (float) $s->precio,
                'periodo' => $s->periodo->value,
                'dia_cobro' => $s->dia_cobro,
                'proxima_renovacion' => $s->proxima_renovacion?->toDateString(),
            ])->values()->all(),
            'creado' => $empresa->created_at?->toIso8601String(),
        ];
    }
}
