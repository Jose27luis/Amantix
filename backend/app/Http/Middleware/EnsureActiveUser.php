<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario instanceof User || ! $usuario->activo) {
            abort(401, 'Tu sesión ya no es válida.');
        }

        if ($usuario->debe_cambiar_password && ! $request->routeIs('auth.me', 'auth.logout', 'auth.password')) {
            abort(403, 'Debes cambiar tu contraseña antes de continuar.');
        }

        return $next($request);
    }
}
