<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\Role;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();
        $permitidos = array_map(static fn (string $rol): Role => Role::from($rol), $roles);

        if (! $usuario instanceof User || ! in_array($usuario->rol, $permitidos, true)) {
            abort(403, 'No tienes permiso para esta acción.');
        }

        return $next($request);
    }
}
