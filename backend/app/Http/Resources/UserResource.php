<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $usuario = $this->resource;

        if (! $usuario instanceof User) {
            return [];
        }

        return [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'correo' => $usuario->correo,
            'rol' => $usuario->rol->value,
            'empresa' => $usuario->empresa === null ? null : [
                'id' => $usuario->empresa->id,
                'razon_social' => $usuario->empresa->razon_social,
            ],
            'activo' => $usuario->activo,
            'debe_cambiar_password' => $usuario->debe_cambiar_password,
            'ultimo_ingreso' => $usuario->ultimo_ingreso?->toIso8601String(),
            'creado' => $usuario->created_at?->toIso8601String(),
        ];
    }
}
