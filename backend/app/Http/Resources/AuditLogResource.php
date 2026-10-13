<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $registro = $this->resource;

        if (! $registro instanceof AuditLog) {
            return [];
        }

        return [
            'id' => $registro->id,
            'accion' => $registro->accion,
            'detalle' => $registro->detalle,
            'autor' => $registro->usuario?->nombre,
            'creado' => $registro->created_at?->toIso8601String(),
        ];
    }
}
