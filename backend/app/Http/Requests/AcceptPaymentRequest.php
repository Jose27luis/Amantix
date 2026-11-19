<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcceptPaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'monto' => ['nullable', 'numeric', 'min:0.01', 'max:999999'],
            'numero_operacion' => ['nullable', 'string', 'max:60'],
        ];
    }

    public function attributes(): array
    {
        return [
            'numero_operacion' => 'número de operación',
        ];
    }
}
