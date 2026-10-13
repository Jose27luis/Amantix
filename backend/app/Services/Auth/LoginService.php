<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginService
{
    private const INTENTOS_MAXIMOS = 5;

    private const SEGUNDOS_BLOQUEO = 900;

    public function ingresar(string $correo, string $password, string $ip): array
    {
        $correo = Str::lower(trim($correo));
        $clave = 'login:'.$correo.'|'.$ip;

        if (RateLimiter::tooManyAttempts($clave, self::INTENTOS_MAXIMOS)) {
            $minutos = (int) ceil(RateLimiter::availableIn($clave) / 60);

            throw ValidationException::withMessages([
                'correo' => "Demasiados intentos. Vuelve a intentar en {$minutos} minutos.",
            ]);
        }

        $usuario = User::query()->where('correo', $correo)->first();

        if ($usuario === null || ! Hash::check($password, $usuario->password)) {
            RateLimiter::hit($clave, self::SEGUNDOS_BLOQUEO);

            throw ValidationException::withMessages(['correo' => 'Correo o contraseña incorrectos.']);
        }

        if (! $usuario->activo) {
            throw ValidationException::withMessages(['correo' => 'Tu usuario está desactivado.']);
        }

        RateLimiter::clear($clave);

        $usuario->forceFill(['ultimo_ingreso' => now()])->save();

        return [
            'token' => $usuario->createToken('panel')->plainTextToken,
            'usuario' => $usuario,
        ];
    }
}
