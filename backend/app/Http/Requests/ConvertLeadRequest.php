<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\Ruc;
use Illuminate\Foundation\Http\FormRequest;

class ConvertLeadRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'razon_social' => ['required', 'string', 'min:2', 'max:200'],
            'ruc' => ['required', 'string', new Ruc()],
            'rubro' => ['nullable', 'string', 'max:120'],
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'plan_id' => ['required', 'integer', 'exists:planes,id'],
            'precio' => ['required', 'numeric', 'min:0', 'max:999999'],
            'fecha_alta' => ['required', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'razon_social' => 'razón social',
            'producto_id' => 'producto',
            'plan_id' => 'plan',
            'fecha_alta' => 'fecha de alta',
        ];
    }
}
