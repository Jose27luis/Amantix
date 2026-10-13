<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Role;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'correo',
        'password',
        'rol',
        'activo',
        'debe_cambiar_password',
        'ultimo_ingreso',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'rol' => Role::class,
            'activo' => 'boolean',
            'debe_cambiar_password' => 'boolean',
            'ultimo_ingreso' => 'datetime',
        ];
    }

    public function esAdministrador(): bool
    {
        return $this->rol === Role::Administrador;
    }
}
