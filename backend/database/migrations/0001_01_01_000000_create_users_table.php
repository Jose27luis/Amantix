<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 120);
            $table->string('correo', 160)->unique();
            $table->string('password');
            $table->string('rol', 20);
            $table->boolean('activo')->default(true);
            $table->boolean('debe_cambiar_password')->default(true);
            $table->timestamp('ultimo_ingreso')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index(['rol', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
