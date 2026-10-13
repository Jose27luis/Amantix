<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Role;
use App\Models\User;
use App\Services\Users\UserAccountService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdminCommand extends Command
{
    protected $signature = 'amantix:create-admin {nombre} {correo}';

    protected $description = 'Crea un usuario administrador con una contraseña temporal';

    public function handle(UserAccountService $servicio): int
    {
        $datos = [
            'nombre' => (string) $this->argument('nombre'),
            'correo' => (string) $this->argument('correo'),
            'rol' => Role::Administrador->value,
        ];

        $validacion = Validator::make($datos, [
            'nombre' => ['required', 'string', 'min:2', 'max:120'],
            'correo' => ['required', 'email', 'max:160', 'unique:usuarios,correo'],
        ]);

        if ($validacion->fails()) {
            foreach ($validacion->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $resultado = $servicio->crear($datos, null);
        $usuario = $resultado['usuario'];

        if (! $usuario instanceof User) {
            return self::FAILURE;
        }

        $this->info("Administrador creado: {$usuario->correo}");
        $this->line("Contraseña temporal: {$resultado['password_temporal']}");

        return self::SUCCESS;
    }
}
