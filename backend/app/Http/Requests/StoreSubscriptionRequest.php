<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\BillingPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriptionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'plan_id' => ['required', 'integer', 'exists:planes,id'],
            'precio' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'periodo' => ['nullable', Rule::enum(BillingPeriod::class)],
            'fecha_alta' => ['required', 'date'],
            'proxima_renovacion' => ['nullable', 'date', 'after:fecha_alta'],
        ];
    }

    public function attributes(): array
    {
        return [
            'producto_id' => 'producto',
            'plan_id' => 'plan',
            'fecha_alta' => 'fecha de alta',
            'proxima_renovacion' => 'próxima renovación',
        ];
    }
}
