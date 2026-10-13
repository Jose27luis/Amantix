<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\BillingPeriod;
use App\Enums\SubscriptionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubscriptionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'plan_id' => ['sometimes', 'integer', 'exists:planes,id'],
            'precio' => ['sometimes', 'numeric', 'min:0', 'max:999999'],
            'periodo' => ['sometimes', Rule::enum(BillingPeriod::class)],
            'proxima_renovacion' => ['sometimes', 'date'],
            'estado' => ['sometimes', Rule::enum(SubscriptionStatus::class)],
        ];
    }

    public function attributes(): array
    {
        return [
            'plan_id' => 'plan',
            'proxima_renovacion' => 'próxima renovación',
        ];
    }
}
