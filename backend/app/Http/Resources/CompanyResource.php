<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $empresa = $this->resource;

        if (! $empresa instanceof Company) {
            return [];
        }

        $proxima = $empresa->getAttribute('proxima_renovacion');

        return [
            'id' => $empresa->id,
            'razon_social' => $empresa->razon_social,
            'ruc' => $empresa->ruc,
            'rubro' => $empresa->rubro,
            'direccion' => $empresa->direccion,
            'contacto' => $empresa->contacto,
            'telefono' => $empresa->telefono,
            'correo' => $empresa->correo,
            'suscripciones_activas' => $empresa->getAttribute('suscripciones_activas'),
            'tickets_abiertos' => $empresa->getAttribute('tickets_abiertos'),
            'proxima_renovacion' => is_string($proxima) ? substr($proxima, 0, 10) : null,
            'creado' => $empresa->created_at?->toIso8601String(),
        ];
    }
}
