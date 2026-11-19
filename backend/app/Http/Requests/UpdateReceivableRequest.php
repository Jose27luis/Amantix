<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReceivableRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'concepto' => ['sometimes', 'string', 'min:3', 'max:255'],
            'monto' => ['sometimes', 'numeric', 'min:0.01', 'max:999999'],
            'vence' => ['sometimes', 'date'],
        ];
    }
}
