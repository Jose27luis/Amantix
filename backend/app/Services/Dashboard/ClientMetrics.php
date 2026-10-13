<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\SubscriptionStatus;
use App\Models\Company;
use App\Models\Subscription;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class ClientMetrics
{
    private const DIAS_RENOVACION = 30;

    public function calcular(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): array
    {
        $activas = Subscription::query()
            ->with(['producto', 'plan'])
            ->where('estado', SubscriptionStatus::Activa)
            ->when($productoId !== null, fn (Builder $consulta): Builder => $consulta->where('producto_id', $productoId))
            ->get();

        $ingresoPorProducto = [];
        foreach ($activas as $suscripcion) {
            $nombre = $suscripcion->producto?->nombre ?? 'Sin producto';
            $ingresoPorProducto[$nombre] = ($ingresoPorProducto[$nombre] ?? 0) + $suscripcion->montoMensual();
        }

        $hoy = CarbonImmutable::today();

        return [
            'activos' => $activas->pluck('empresa_id')->unique()->count(),
            'suscripciones_activas' => $activas->count(),
            'ingreso_mensual' => round($activas->sum(fn (Subscription $suscripcion): float => $suscripcion->montoMensual()), 2),
            'altas' => Subscription::query()
                ->whereBetween('fecha_alta', [$desde->toDateString(), $hasta->toDateString()])
                ->when($productoId !== null, fn (Builder $consulta): Builder => $consulta->where('producto_id', $productoId))
                ->count(),
            'bajas' => Subscription::query()
                ->where('estado', SubscriptionStatus::Baja)
                ->whereBetween('updated_at', [$desde, $hasta])
                ->when($productoId !== null, fn (Builder $consulta): Builder => $consulta->where('producto_id', $productoId))
                ->count(),
            'renovaciones_proximas' => $activas
                ->filter(fn (Subscription $suscripcion): bool => $suscripcion->proxima_renovacion !== null
                    && $suscripcion->proxima_renovacion->betweenIncluded($hoy, $hoy->addDays(self::DIAS_RENOVACION)))
                ->count(),
            'empresas' => Company::query()->count(),
            'ingreso_por_producto' => array_map(
                static fn (string $producto, float $monto): array => ['producto' => $producto, 'monto' => round($monto, 2)],
                array_keys($ingresoPorProducto),
                array_values($ingresoPorProducto),
            ),
        ];
    }
}
