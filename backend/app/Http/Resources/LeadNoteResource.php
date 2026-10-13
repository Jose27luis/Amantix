<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\LeadNote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $nota = $this->resource;

        if (! $nota instanceof LeadNote) {
            return [];
        }

        return [
            'id' => $nota->id,
            'nota' => $nota->nota,
            'autor' => $nota->usuario?->nombre,
            'creado' => $nota->created_at?->toIso8601String(),
        ];
    }
}
