<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportPaymentRequest extends FormRequest
{
    public function rules(): array
    {
        $esCliente = $this->user()?->esAdministrador() !== true;

        return [
            'metodo' => ['required', Rule::enum(PaymentMethod::class)],
            'numero_operacion' => [
                Rule::requiredIf($esCliente && ! in_array($this->input('metodo'), [PaymentMethod::Efectivo->value, PaymentMethod::Otro->value], true)),
                'nullable',
                'string',
                'max:60',
            ],
            'fecha_pago' => ['required', 'date', 'before_or_equal:today'],
            'monto' => ['nullable', 'numeric', 'min:0.01', 'max:999999'],
            'captura' => [
                Rule::requiredIf($esCliente),
                'nullable',
                'file',
                'max:5120',
                'mimetypes:image/jpeg,image/png,image/webp,application/pdf',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'metodo' => 'medio de pago',
            'numero_operacion' => 'número de operación',
            'fecha_pago' => 'fecha de pago',
            'captura' => 'captura del pago',
        ];
    }
}
