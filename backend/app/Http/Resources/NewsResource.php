<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    private bool $conContenido = true;

    public function sinContenido(): self
    {
        $this->conContenido = false;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $noticia = $this->resource;

        if (! $noticia instanceof News) {
            return [];
        }

        return [
            'id' => $noticia->id,
            'slug' => $noticia->slug,
            'titulo' => $noticia->titulo,
            'resumen' => $noticia->resumen,
            'contenido' => $this->when($this->conContenido, $noticia->contenido),
            'imagen' => [
                'url' => '/api/news/images/'.$noticia->imagen,
                'ancho' => $noticia->imagen_ancho,
                'alto' => $noticia->imagen_alto,
            ],
            'estado' => $noticia->estado->value,
            'publicada_en' => $noticia->publicada_en?->toIso8601String(),
            'actualizada_en' => $noticia->updated_at?->toIso8601String(),
            'autor' => $noticia->autor?->nombre,
        ];
    }
}
