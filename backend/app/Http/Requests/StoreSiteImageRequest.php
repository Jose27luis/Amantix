<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\SiteImageLocation;
use App\Enums\SiteImageSection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSiteImageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ubicacion' => ['required', Rule::enum(SiteImageLocation::class)],
            'seccion' => ['sometimes', Rule::enum(SiteImageSection::class)],
            'titulo' => ['required', 'string', 'min:3', 'max:160'],
            'imagen' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
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
