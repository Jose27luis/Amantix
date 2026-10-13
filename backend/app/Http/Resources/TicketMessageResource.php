<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $mensaje = $this->resource;

        if (! $mensaje instanceof TicketMessage) {
            return [];
        }

        return [
            'id' => $mensaje->id,
            'mensaje' => $mensaje->mensaje,
            'interno' => $mensaje->interno,
            'autor' => $mensaje->usuario === null ? null : [
                'nombre' => $mensaje->usuario->nombre,
                'es_equipo' => $mensaje->usuario->esAdministrador(),
            ],
            'adjuntos' => AttachmentResource::collection($mensaje->adjuntos)->resolve($request),
            'creado' => $mensaje->created_at?->toIso8601String(),
        ];
    }
}
