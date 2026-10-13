<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\LoginService;
use App\Services\Users\UserAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(LoginRequest $request, LoginService $servicio): JsonResponse
    {
        $resultado = $servicio->ingresar(
            (string) $request->validated('correo'),
            (string) $request->validated('password'),
            (string) $request->ip(),
        );

        return response()->json([
            'token' => $resultado['token'],
            'usuario' => UserResource::make($resultado['usuario'])->resolve($request),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(UserResource::make($this->usuario($request))->resolve($request));
    }

    public function logout(Request $request): Response
    {
        $token = $this->usuario($request)->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->noContent();
    }

    public function cambiarPassword(ChangePasswordRequest $request, UserAccountService $servicio): JsonResponse
    {
        $usuario = $this->usuario($request);
        $servicio->cambiarPropiaPassword($usuario, (string) $request->validated('password'));

        return response()->json(UserResource::make($usuario->refresh())->resolve($request));
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
