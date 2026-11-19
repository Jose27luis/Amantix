<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Integration;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateIntegration
{
    public const ATRIBUTO = 'integracion';

    public function handle(Request $request, Closure $next): Response
    {
        $token = (string) $request->bearerToken();
        abort_if($token === '', 401, 'Falta la llave de integración.');

        $integracion = Integration::query()
            ->where('token_hash', hash('sha256', $token))
            ->where('activo', true)
            ->first();

        abort_if($integracion === null, 401, 'Llave de integración no válida.');

        if ($integracion->ultimo_uso_at === null || $integracion->ultimo_uso_at->lt(now()->subMinutes(5))) {
            $integracion->forceFill(['ultimo_uso_at' => now()])->saveQuietly();
        }

        $request->attributes->set(self::ATRIBUTO, $integracion);

        return $next($request);
    }
}
