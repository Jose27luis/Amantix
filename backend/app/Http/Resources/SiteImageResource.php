<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\SiteImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imagen = $this->resource;

        if (! $imagen instanceof SiteImage) {
            return [];
        }

        return [
            'id' => $imagen->id,
            'ubicacion' => $imagen->ubicacion->value,
            'seccion' => $imagen->seccion->value,
            'titulo' => $imagen->titulo,
            'url' => '/api/site-images/files/'.$imagen->archivo,
            'ancho' => $imagen->ancho,
            'alto' => $imagen->alto,
            'orden' => $imagen->orden,
            'visible' => $imagen->visible,
        ];
    }
}
