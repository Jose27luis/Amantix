<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Company;
use App\Rules\Ruc;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
{
    public function rules(): array
    {
        $empresa = $this->route('company');
        $id = $empresa instanceof Company ? $empresa->id : null;

        return [
            'razon_social' => ['sometimes', 'string', 'min:2', 'max:200'],
            'ruc' => ['sometimes', 'string', new Ruc(), Rule::unique('empresas', 'ruc')->ignore($id)],
            'rubro' => ['sometimes', 'nullable', 'string', 'max:120'],
            'direccion' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contacto' => ['sometimes', 'nullable', 'string', 'max:120'],
            'telefono' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:/^[0-9+\s()-]{6,30}$/'],
            'correo' => ['sometimes', 'nullable', 'email', 'max:160'],
        ];
    }
}
