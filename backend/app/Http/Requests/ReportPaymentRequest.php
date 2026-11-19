<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Models\PaymentAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportPaymentRequest extends FormRequest
{
    public function rules(): array
    {
        $esCliente = $this->user()?->esAdministrador() !== true;

        $tipo = $this->input('metodo_pago_id') !== null
            ? PaymentAccount::query()->whereKey((int) $this->input('metodo_pago_id'))->value('tipo')
            : $this->input('metodo');
        $tipo = $tipo instanceof PaymentMethod ? $tipo->value : $tipo;

        return [
            'metodo_pago_id' => [
                Rule::requiredIf($esCliente),
                'nullable',
                'integer',
                Rule::exists('metodos_pago', 'id')->where('activo', true),
            ],
            'metodo' => ['required_without:metodo_pago_id', 'nullable', Rule::enum(PaymentMethod::class)],
            'numero_operacion' => [
                Rule::requiredIf($esCliente && ! in_array($tipo, [PaymentMethod::Efectivo->value, PaymentMethod::Otro->value], true)),
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
            'metodo_pago_id' => 'cuenta a la que pagaste',
            'numero_operacion' => 'número de operación',
            'fecha_pago' => 'fecha de pago',
            'captura' => 'captura del pago',
        ];
    }
}
