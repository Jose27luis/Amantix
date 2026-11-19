<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ReceivableStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReceivableIndexRequest extends FormRequest
{
    public function rules(): array
    {
        $estados = [...array_map(static fn (ReceivableStatus $estado): string => $estado->value, ReceivableStatus::cases()), 'por_cobrar', 'vencidas'];

        return [
            'buscar' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', Rule::in($estados)],
            'empresa_id' => ['nullable', 'integer', 'exists:empresas,id'],
        ];
    }
}
