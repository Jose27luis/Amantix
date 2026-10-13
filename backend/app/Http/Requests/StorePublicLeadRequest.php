<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\LeadSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublicLeadRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:2', 'max:120'],
            'empresa' => ['nullable', 'string', 'max:160'],
            'correo' => ['required', 'email', 'max:160'],
            'telefono' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\s()-]{6,30}$/'],
            'producto' => ['nullable', 'string', Rule::exists('productos', 'slug')->where('visible', true)],
            'mensaje' => ['required', 'string', 'min:4', 'max:3000'],
            'origen' => ['sometimes', Rule::enum(LeadSource::class)],
            'sitio_web' => ['present', 'nullable', 'max:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'sitio_web.max' => 'No pudimos registrar tu solicitud.',
        ];
    }
}
