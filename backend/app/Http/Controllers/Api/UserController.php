<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Users\UserAccountService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:120'],
            'rol' => ['nullable', Rule::enum(Role::class)],
        ]);

        $usuarios = User::query()
            ->when($filtros['buscar'] ?? null, function (Builder $consulta, string $texto): void {
                $patron = '%'.$texto.'%';
                $consulta->where(fn (Builder $grupo): Builder => $grupo->where('nombre', 'like', $patron)->orWhere('correo', 'like', $patron));
            })
            ->when($filtros['rol'] ?? null, fn (Builder $consulta, string $rol): Builder => $consulta->where('rol', $rol))
            ->orderBy('nombre')
            ->paginate(20);

        return UserResource::collection($usuarios);
    }

    public function store(StoreUserRequest $request, UserAccountService $servicio): JsonResponse
    {
        $resultado = $servicio->crear($request->validated(), $this->autor($request));

        return response()->json([
            'usuario' => UserResource::make($resultado['usuario'])->resolve($request),
            'password_temporal' => $resultado['password_temporal'],
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user, UserAccountService $servicio): JsonResponse
    {
        $usuario = $servicio->actualizar($user, $request->validated(), $this->autor($request));

        return response()->json(UserResource::make($usuario)->resolve($request));
    }

    public function restablecerPassword(Request $request, User $user, UserAccountService $servicio): JsonResponse
    {
        $password = $servicio->restablecerPassword($user, $this->autor($request));

        return response()->json(['password_temporal' => $password]);
    }

    private function autor(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
