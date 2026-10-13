<?php

declare(strict_types=1);

namespace App\Services\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class TicketSearch
{
    public function buscar(array $filtros, User $usuario): LengthAwarePaginator
    {
        return Ticket::query()
            ->with(['empresa', 'producto', 'asignado'])
            ->when(! $usuario->esAdministrador(), fn (Builder $consulta): Builder => $consulta->where('empresa_id', $usuario->empresa_id))
            ->when($filtros['buscar'] ?? null, function (Builder $consulta, string $texto): void {
                $patron = '%'.$texto.'%';
                $consulta->where(fn (Builder $grupo): Builder => $grupo
                    ->where('asunto', 'like', $patron)
                    ->orWhere('codigo', 'like', $patron)
                    ->orWhereHas('empresa', fn (Builder $empresa): Builder => $empresa->where('razon_social', 'like', $patron)->orWhere('ruc', 'like', $patron)));
            })
            ->when($filtros['estado'] ?? null, function (Builder $consulta, string $estado): void {
                $estado === 'activos'
                    ? $consulta->whereIn('estado', TicketStatus::activos())
                    : $consulta->where('estado', $estado);
            })
            ->when($filtros['prioridad'] ?? null, fn (Builder $consulta, string $prioridad): Builder => $consulta->where('prioridad', $prioridad))
            ->when($filtros['producto_id'] ?? null, fn (Builder $consulta, int|string $id): Builder => $consulta->where('producto_id', (int) $id))
            ->when($filtros['empresa_id'] ?? null, fn (Builder $consulta, int|string $id): Builder => $consulta->where('empresa_id', (int) $id))
            ->when(($filtros['sin_responder'] ?? false) === true, fn (Builder $consulta): Builder => $consulta
                ->where('pendiente_respuesta', true)
                ->whereIn('estado', TicketStatus::activos()))
            ->orderByDesc('pendiente_respuesta')
            ->orderByDesc('updated_at')
            ->paginate(20);
    }
}
