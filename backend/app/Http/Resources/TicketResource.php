<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $ticket = $this->resource;

        if (! $ticket instanceof Ticket) {
            return [];
        }

        return [
            'id' => $ticket->id,
            'codigo' => $ticket->codigo,
            'asunto' => $ticket->asunto,
            'prioridad' => $ticket->prioridad->value,
            'estado' => $ticket->estado->value,
            'pendiente_respuesta' => $ticket->pendiente_respuesta,
            'puede_reabrirse' => $ticket->puedeReabrirse(),
            'empresa' => $ticket->empresa === null ? null : [
                'id' => $ticket->empresa->id,
                'razon_social' => $ticket->empresa->razon_social,
            ],
            'producto' => $ticket->producto === null ? null : [
                'id' => $ticket->producto->id,
                'nombre' => $ticket->producto->nombre,
            ],
            'asignado' => $ticket->asignado === null ? null : [
                'id' => $ticket->asignado->id,
                'nombre' => $ticket->asignado->nombre,
            ],
            'primera_respuesta' => $ticket->primera_respuesta?->toIso8601String(),
            'resuelto_en' => $ticket->resuelto_en?->toIso8601String(),
            'creado' => $ticket->created_at?->toIso8601String(),
            'actualizado' => $ticket->updated_at?->toIso8601String(),
        ];
    }
}
