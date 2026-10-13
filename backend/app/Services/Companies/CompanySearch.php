<?php

declare(strict_types=1);

namespace App\Services\Companies;

use App\Enums\SubscriptionStatus;
use App\Enums\TicketStatus;
use App\Models\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class CompanySearch
{
    public function buscar(array $filtros): LengthAwarePaginator
    {
        return Company::query()
            ->withCount([
                'suscripciones as suscripciones_activas' => fn (Builder $consulta): Builder => $consulta->where('estado', SubscriptionStatus::Activa),
                'tickets as tickets_abiertos' => fn (Builder $consulta): Builder => $consulta->whereIn('estado', TicketStatus::activos()),
            ])
            ->withMin([
                'suscripciones as proxima_renovacion' => fn (Builder $consulta): Builder => $consulta->where('estado', SubscriptionStatus::Activa),
            ], 'proxima_renovacion')
            ->when($filtros['buscar'] ?? null, function (Builder $consulta, string $texto): void {
                $patron = '%'.$texto.'%';
                $consulta->where(fn (Builder $grupo): Builder => $grupo
                    ->where('razon_social', 'like', $patron)
                    ->orWhere('ruc', 'like', $patron)
                    ->orWhere('contacto', 'like', $patron)
                    ->orWhere('correo', 'like', $patron));
            })
            ->when($filtros['producto_id'] ?? null, fn (Builder $consulta, int|string $id): Builder => $consulta->whereHas(
                'suscripciones',
                fn (Builder $sub): Builder => $sub->where('producto_id', (int) $id)->where('estado', SubscriptionStatus::Activa),
            ))
            ->when($filtros['renueva_en'] ?? null, fn (Builder $consulta, int|string $dias): Builder => $consulta->whereHas(
                'suscripciones',
                fn (Builder $sub): Builder => $sub
                    ->where('estado', SubscriptionStatus::Activa)
                    ->whereBetween('proxima_renovacion', [now()->toDateString(), now()->addDays((int) $dias)->toDateString()]),
            ))
            ->orderBy('razon_social')
            ->paginate(20);
    }
}
