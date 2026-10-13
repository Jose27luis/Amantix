<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\LeadStatus;
use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'estado' => ['sometimes', Rule::enum(LeadStatus::class)],
            'motivo_perdida' => [
                Rule::requiredIf(fn (): bool => $this->input('estado') === LeadStatus::Perdido->value),
                'nullable',
                'string',
                'max:255',
            ],
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
            'motivo_perdida' => 'motivo',
            'asignado_a' => 'responsable',
        ];
    }
}
