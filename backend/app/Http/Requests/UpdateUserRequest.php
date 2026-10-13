<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        $usuario = $this->route('user');
        $id = $usuario instanceof User ? $usuario->id : null;

        return [
            'nombre' => ['sometimes', 'string', 'min:2', 'max:120'],
            'correo' => ['sometimes', 'email', 'max:160', Rule::unique('usuarios', 'correo')->ignore($id)],
            'rol' => ['sometimes', Rule::enum(Role::class)],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $usuario = $this->route('user');
                $actual = $this->user();

                if (! $usuario instanceof User || ! $actual instanceof User || $usuario->id !== $actual->id) {
                    return;
                }

                if ($this->has('activo') && ! $this->boolean('activo')) {
                    $validator->errors()->add('activo', 'No puedes desactivar tu propio usuario.');
                }

                if ($this->has('rol') && $this->input('rol') !== Role::Administrador->value) {
                    $validator->errors()->add('rol', 'No puedes quitarte el rol de administrador.');
                }
            },
        ];
    }
}
