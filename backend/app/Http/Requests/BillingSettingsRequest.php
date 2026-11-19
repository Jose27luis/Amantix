<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BillingSettingsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'dias_anticipacion' => ['required', 'integer', 'min:0', 'max:30'],
            'recordatorios' => ['present', 'array', 'max:8'],
            'recordatorios.*' => ['integer', 'min:-30', 'max:60'],
            'mensaje' => ['required', 'string', 'min:20', 'max:800'],
        ];
    }

    public function attributes(): array
    {
        return [
            'dias_anticipacion' => 'días de anticipación',
            'recordatorios.*' => 'día de aviso',
        ];
    }
}
