<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Company;
use App\Models\User;
use App\Services\Users\UserAccountService;
use Illuminate\Http\JsonResponse;

class CompanyUserController extends Controller
{
    public function store(StoreClientUserRequest $request, Company $company, UserAccountService $servicio): JsonResponse
    {
        $autor = $request->user();
        abort_unless($autor instanceof User, 401);

        $resultado = $servicio->crear([
            ...$request->validated(),
            'rol' => Role::Cliente->value,
            'empresa_id' => $company->id,
        ], $autor);

        $usuario = $resultado['usuario'];
        $usuario->load('empresa');

        return response()->json([
            'usuario' => UserResource::make($usuario)->resolve($request),
            'password_temporal' => $resultado['password_temporal'],
        ], 201);
    }
}
