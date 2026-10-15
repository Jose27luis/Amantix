<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\SiteImageLocation;
use App\Enums\SiteImageSection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSiteImageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ubicacion' => ['sometimes', Rule::enum(SiteImageLocation::class)],
            'seccion' => ['sometimes', Rule::enum(SiteImageSection::class)],
            'titulo' => ['sometimes', 'string', 'min:3', 'max:160'],
            'orden' => ['sometimes', 'integer', 'min:0', 'max:999'],
            'visible' => ['sometimes', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'ubicacion' => 'página',
            'seccion' => 'parte de la página',
            'titulo' => 'descripción',
        ];
    }
}
