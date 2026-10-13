<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketIndexRequest extends FormRequest
{
    public function rules(): array
    {
        $estados = [...array_map(static fn (TicketStatus $estado): string => $estado->value, TicketStatus::cases()), 'activos'];

        return [
            'buscar' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', Rule::in($estados)],
            'prioridad' => ['nullable', Rule::enum(TicketPriority::class)],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'empresa_id' => ['nullable', 'integer', 'exists:empresas,id'],
            'sin_responder' => ['nullable', 'boolean'],
        ];
    }
}
