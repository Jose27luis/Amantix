<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $adjunto = $this->resource;

        if (! $adjunto instanceof Attachment) {
            return [];
        }

        return [
            'id' => $adjunto->id,
            'nombre' => $adjunto->nombre,
            'tipo' => $adjunto->tipo,
            'tamano' => $adjunto->tamano,
        ];
    }
}
