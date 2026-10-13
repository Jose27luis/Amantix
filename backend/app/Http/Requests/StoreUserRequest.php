<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:2', 'max:120'],
            'correo' => ['required', 'email', 'max:160', Rule::unique('usuarios', 'correo')],
            'rol' => ['required', Rule::enum(Role::class)],
        ];
    }
}
