<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\NewsStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNewsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'string', 'min:6', 'max:160'],
            'resumen' => ['sometimes', 'nullable', 'string', 'max:300'],
            'contenido' => ['sometimes', 'string', 'min:20', 'max:60000'],
            'estado' => ['sometimes', Rule::enum(NewsStatus::class)],
            'imagen' => ['sometimes', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ];
    }

    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'contenido' => 'texto',
            'imagen' => 'imagen',
        ];
    }
}
