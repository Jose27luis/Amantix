<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Product;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class LeadMetrics
{
    private const SEMANAS = 12;

    public function calcular(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): array
    {
        $dias = (int) $desde->diffInDays($hasta) + 1;
        $anteriorHasta = $desde->subDay()->endOfDay();
        $anteriorDesde = $anteriorHasta->subDays($dias - 1)->startOfDay();

        $total = $this->base($desde, $hasta, $productoId)->count();
        $anterior = $this->base($anteriorDesde, $anteriorHasta, $productoId)->count();
        $ganados = $this->base($desde, $hasta, $productoId)->where('estado', LeadStatus::Ganado)->count();
        $perdidos = $this->base($desde, $hasta, $productoId)->where('estado', LeadStatus::Perdido)->count();

        return [
            'periodo' => ['desde' => $desde->toDateString(), 'hasta' => $hasta->toDateString()],
            'indicadores' => [
                'leads' => $total,
                'leads_periodo_anterior' => $anterior,
                'ganados' => $ganados,
                'perdidos' => $perdidos,
                'conversion' => $total === 0 ? 0.0 : round($ganados / $total * 100, 1),
                'sin_atender' => Lead::query()
                    ->where('estado', LeadStatus::Nuevo)
                    ->when($productoId !== null, fn (Builder $consulta): Builder => $consulta->where('producto_id', $productoId))
                    ->count(),
            ],
            'por_semana' => $this->porSemana($hasta, $productoId),
            'por_producto' => $this->porProducto($desde, $hasta, $productoId),
            'por_origen' => $this->porOrigen($desde, $hasta, $productoId),
            'embudo' => $this->embudo($desde, $hasta, $productoId),
        ];
    }

    private function base(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): Builder
    {
        return Lead::query()
            ->whereBetween('created_at', [$desde, $hasta])
            ->when($productoId !== null, fn (Builder $consulta): Builder => $consulta->where('producto_id', $productoId));
    }

    private function porSemana(CarbonImmutable $hasta, ?int $productoId): array
    {
        $finSemana = $hasta->endOfWeek();
        $inicio = $finSemana->subWeeks(self::SEMANAS - 1)->startOfWeek();

        $fechas = $this->base($inicio, $finSemana, $productoId)->pluck('created_at');

        $semanas = [];
        for ($i = 0; $i < self::SEMANAS; $i++) {
            $semanas[$inicio->addWeeks($i)->toDateString()] = 0;
        }

        foreach ($fechas as $fecha) {
            $clave = CarbonImmutable::parse($fecha)->startOfWeek()->toDateString();
            if (array_key_exists($clave, $semanas)) {
                $semanas[$clave]++;
            }
        }

        return array_map(
            static fn (string $semana, int $total): array => ['semana' => $semana, 'total' => $total],
            array_keys($semanas),
            array_values($semanas),
        );
    }

    private function porProducto(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): array
    {
        $conteos = $this->base($desde, $hasta, $productoId)
            ->selectRaw('producto_id, count(*) as total')
            ->groupBy('producto_id')
            ->pluck('total', 'producto_id');

        $productos = Product::query()->orderBy('orden')->get(['id', 'nombre']);

        $filas = $productos
            ->filter(fn (Product $producto): bool => $productoId === null || $producto->id === $productoId)
            ->map(fn (Product $producto): array => [
                'producto' => $producto->nombre,
                'total' => (int) ($conteos[$producto->id] ?? 0),
            ])
            ->values()
            ->all();

        if ($productoId === null) {
            $filas[] = ['producto' => 'Sin definir', 'total' => (int) ($conteos[''] ?? 0)];
        }

        return $filas;
    }

    private function porOrigen(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): array
    {
        $conteos = $this->base($desde, $hasta, $productoId)
            ->selectRaw('origen, count(*) as total')
            ->groupBy('origen')
            ->pluck('total', 'origen');

        return array_map(
            static fn (LeadSource $origen): array => ['origen' => $origen->value, 'total' => (int) ($conteos[$origen->value] ?? 0)],
            LeadSource::cases(),
        );
    }

    private function embudo(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): array
    {
        $conteos = $this->base($desde, $hasta, $productoId)
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        return array_map(
            static fn (LeadStatus $estado): array => ['estado' => $estado->value, 'total' => (int) ($conteos[$estado->value] ?? 0)],
            LeadStatus::cases(),
        );
    }
}
