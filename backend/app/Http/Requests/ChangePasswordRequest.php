<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'password_actual' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', 'confirmed', 'different:password_actual', Password::min(8)],
        ];
    }
}
