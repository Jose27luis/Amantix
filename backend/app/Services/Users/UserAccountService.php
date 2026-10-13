<?php

declare(strict_types=1);

namespace App\Services\Users;

use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserAccountService
{
    public function __construct(
        private readonly AuditRecorder $auditoria,
        private readonly TemporaryPasswordGenerator $generador,
    ) {
    }

    public function crear(array $datos, ?User $autor): array
    {
        $password = $this->generador->generar();

        $usuario = User::query()->create([
            'nombre' => $datos['nombre'],
            'correo' => Str::lower(trim($datos['correo'])),
            'rol' => $datos['rol'],
            'password' => $password,
            'activo' => true,
            'debe_cambiar_password' => true,
        ]);

        $this->auditoria->registrar($autor, 'usuario_creado', $usuario, ['rol' => $usuario->rol->value]);

        return ['usuario' => $usuario, 'password_temporal' => $password];
    }

    public function actualizar(User $usuario, array $datos, User $autor): User
    {
        return DB::transaction(function () use ($usuario, $datos, $autor): User {
            if (array_key_exists('correo', $datos)) {
                $datos['correo'] = Str::lower(trim($datos['correo']));
            }

            $usuario->fill($datos);
            $cambios = array_keys($usuario->getDirty());
            $usuario->save();

            if (in_array('activo', $cambios, true) && ! $usuario->activo) {
                $usuario->tokens()->delete();
            }

            if ($cambios !== []) {
                $this->auditoria->registrar($autor, 'usuario_actualizado', $usuario, ['campos' => $cambios]);
            }

            return $usuario;
        });
    }

    public function restablecerPassword(User $usuario, User $autor): string
    {
        $password = $this->generador->generar();

        $usuario->forceFill([
            'password' => $password,
            'debe_cambiar_password' => true,
        ])->save();

        $usuario->tokens()->delete();

        $this->auditoria->registrar($autor, 'password_restablecida', $usuario);

        return $password;
    }

    public function cambiarPropiaPassword(User $usuario, string $nueva): void
    {
        $usuario->forceFill([
            'password' => $nueva,
            'debe_cambiar_password' => false,
        ])->save();

        $this->auditoria->registrar($usuario, 'password_cambiada', $usuario);
    }
}
