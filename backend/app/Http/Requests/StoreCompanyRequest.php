<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\Ruc;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'razon_social' => ['required', 'string', 'min:2', 'max:200'],
            'ruc' => ['required', 'string', new Ruc(), Rule::unique('empresas', 'ruc')],
            'rubro' => ['nullable', 'string', 'max:120'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'contacto' => ['nullable', 'string', 'max:120'],
            'telefono' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\s()-]{6,30}$/'],
            'correo' => ['nullable', 'email', 'max:160'],
        ];
    }
}
