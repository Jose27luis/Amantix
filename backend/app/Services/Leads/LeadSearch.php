<?php

declare(strict_types=1);

namespace App\Services\Leads;

use App\Models\Lead;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class LeadSearch
{
    public function buscar(array $filtros): LengthAwarePaginator
    {
        return Lead::query()
            ->with(['producto', 'asignado'])
            ->when($filtros['buscar'] ?? null, function (Builder $consulta, string $texto): void {
                $patron = '%'.$texto.'%';
                $consulta->where(function (Builder $grupo) use ($patron): void {
                    $grupo->where('nombre', 'like', $patron)
                        ->orWhere('empresa', 'like', $patron)
                        ->orWhere('correo', 'like', $patron)
                        ->orWhere('telefono', 'like', $patron)
                        ->orWhere('codigo', 'like', $patron);
                });
            })
            ->when($filtros['estado'] ?? null, fn (Builder $consulta, string $estado): Builder => $consulta->where('estado', $estado))
            ->when($filtros['origen'] ?? null, fn (Builder $consulta, string $origen): Builder => $consulta->where('origen', $origen))
            ->when($filtros['producto_id'] ?? null, fn (Builder $consulta, int|string $id): Builder => $consulta->where('producto_id', (int) $id))
            ->when($filtros['desde'] ?? null, fn (Builder $consulta, string $desde): Builder => $consulta->where('created_at', '>=', Carbon::parse($desde)->startOfDay()))
            ->when($filtros['hasta'] ?? null, fn (Builder $consulta, string $hasta): Builder => $consulta->where('created_at', '<=', Carbon::parse($hasta)->endOfDay()))
            ->latest()
            ->paginate((int) ($filtros['por_pagina'] ?? 20));
    }
}
