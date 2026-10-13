<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Role;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'estado' => ['sometimes', Rule::enum(TicketStatus::class)],
            'prioridad' => ['sometimes', Rule::enum(TicketPriority::class)],
            'asignado_a' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('usuarios', 'id')->where('rol', Role::Administrador->value)->where('activo', true),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'asignado_a' => 'responsable',
        ];
    }
}
