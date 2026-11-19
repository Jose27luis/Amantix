<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceivableRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'empresa_id' => ['required', 'integer', 'exists:empresas,id'],
            'concepto' => ['required', 'string', 'min:3', 'max:255'],
            'monto' => ['required', 'numeric', 'min:0.01', 'max:999999'],
            'vence' => ['required', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'empresa_id' => 'cliente',
        ];
    }
}
