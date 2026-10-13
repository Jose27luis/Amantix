<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeadIndexRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'buscar' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', Rule::enum(LeadStatus::class)],
            'origen' => ['nullable', Rule::enum(LeadSource::class)],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
            'por_pagina' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }
}
