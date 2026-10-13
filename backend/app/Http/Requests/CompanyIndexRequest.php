<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompanyIndexRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'buscar' => ['nullable', 'string', 'max:120'],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'renueva_en' => ['nullable', 'integer', 'min:1', 'max:365'],
        ];
    }
}
