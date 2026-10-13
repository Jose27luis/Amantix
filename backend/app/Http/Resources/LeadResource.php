<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lead = $this->resource;

        if (! $lead instanceof Lead) {
            return [];
        }

        return [
            'id' => $lead->id,
            'codigo' => $lead->codigo,
            'nombre' => $lead->nombre,
            'empresa' => $lead->empresa,
            'correo' => $lead->correo,
            'telefono' => $lead->telefono,
            'mensaje' => $lead->mensaje,
            'origen' => $lead->origen->value,
            'estado' => $lead->estado->value,
            'motivo_perdida' => $lead->motivo_perdida,
            'producto' => $lead->producto === null ? null : ProductSummaryResource::make($lead->producto)->resolve($request),
            'asignado' => $lead->asignado === null ? null : [
                'id' => $lead->asignado->id,
                'nombre' => $lead->asignado->nombre,
            ],
            'empresa_cliente_id' => $lead->empresa_id,
            'creado' => $lead->created_at?->toIso8601String(),
            'actualizado' => $lead->updated_at?->toIso8601String(),
        ];
    }
}
