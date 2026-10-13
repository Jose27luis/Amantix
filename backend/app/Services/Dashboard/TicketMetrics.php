<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class TicketMetrics
{
    public function calcular(CarbonImmutable $desde, CarbonImmutable $hasta, ?int $productoId): array
    {
        $filtroProducto = fn (Builder $consulta): Builder => $consulta->when(
            $productoId !== null,
            fn (Builder $sub): Builder => $sub->where('producto_id', $productoId),
        );

        $conteos = Ticket::query()
            ->tap($filtroProducto)
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $respondidos = Ticket::query()
            ->tap($filtroProducto)
            ->whereBetween('created_at', [$desde, $hasta])
            ->whereNotNull('primera_respuesta')
            ->get(['created_at', 'primera_respuesta']);

        $minutos = $respondidos->map(
            fn (Ticket $ticket): float => (float) $ticket->created_at?->diffInMinutes($ticket->primera_respuesta),
        );

        return [
            'abiertos' => Ticket::query()->tap($filtroProducto)->whereIn('estado', TicketStatus::activos())->count(),
            'sin_responder' => Ticket::query()
                ->tap($filtroProducto)
                ->whereIn('estado', TicketStatus::activos())
                ->where('pendiente_respuesta', true)
                ->count(),
            'creados' => Ticket::query()->tap($filtroProducto)->whereBetween('created_at', [$desde, $hasta])->count(),
            'primera_respuesta_minutos' => $minutos->isEmpty() ? null : (int) round($minutos->avg()),
            'por_estado' => array_map(
                static fn (TicketStatus $estado): array => ['estado' => $estado->value, 'total' => (int) ($conteos[$estado->value] ?? 0)],
                TicketStatus::cases(),
            ),
        ];
    }
}
