<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentAccountRequest extends FormRequest
{
    public function rules(): array
    {
        $regla = $this->isMethod('PATCH') ? 'sometimes' : 'required';

        return [
            'nombre' => [$regla, 'string', 'min:2', 'max:80'],
            'tipo' => [$regla, Rule::enum(PaymentMethod::class)],
            'titular' => ['sometimes', 'nullable', 'string', 'max:160'],
            'numero' => ['sometimes', 'nullable', 'string', 'max:40'],
            'cci' => ['sometimes', 'nullable', 'string', 'regex:/^[0-9-]{20,30}$/'],
            'instrucciones' => ['sometimes', 'nullable', 'string', 'max:255'],
            'activo' => ['sometimes', 'boolean'],
            'orden' => ['sometimes', 'integer', 'min:0', 'max:999'],
        ];
    }

    public function attributes(): array
    {
        return [
            'numero' => 'número',
            'cci' => 'CCI',
        ];
    }
}
