<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'correo' => ['required', 'email', 'max:160'],
            'password' => ['required', 'string', 'max:255'],
        ];
    }
}
