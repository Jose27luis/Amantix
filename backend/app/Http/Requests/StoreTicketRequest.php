<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'asunto' => ['required', 'string', 'min:4', 'max:160'],
            'prioridad' => ['required', Rule::enum(TicketPriority::class)],
            'mensaje' => ['required', 'string', 'min:4', 'max:5000'],
            'adjuntos' => ['nullable', 'array', 'max:3'],
            'adjuntos.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }

    public function attributes(): array
    {
        return [
            'producto_id' => 'producto',
            'adjuntos' => 'adjuntos',
            'adjuntos.*' => 'adjunto',
        ];
    }
}
