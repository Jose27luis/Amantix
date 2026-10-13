<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $plan = $this->resource;

        if (! $plan instanceof Plan) {
            return [];
        }

        return [
            'id' => $plan->id,
            'nombre' => $plan->nombre,
            'precio' => (float) $plan->precio,
            'periodo' => $plan->periodo->value,
            'descripcion' => $plan->descripcion,
            'caracteristicas' => $plan->caracteristicas,
            'destacado' => $plan->destacado,
        ];
    }
}
