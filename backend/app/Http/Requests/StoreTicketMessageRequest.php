<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketMessageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'mensaje' => ['required', 'string', 'min:1', 'max:5000'],
            'interno' => ['sometimes', 'boolean'],
            'adjuntos' => ['nullable', 'array', 'max:3'],
            'adjuntos.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }

    public function attributes(): array
    {
        return [
            'adjuntos.*' => 'adjunto',
        ];
    }
}
