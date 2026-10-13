<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $producto = $this->resource;

        if (! $producto instanceof Product) {
            return [];
        }

        return [
            'id' => $producto->id,
            'slug' => $producto->slug,
            'codigo' => $producto->codigo,
            'nombre' => $producto->nombre,
        ];
    }
}
