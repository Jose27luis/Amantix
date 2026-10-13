<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table): void {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->foreignId('creado_por')->constrained('usuarios');
            $table->foreignId('asignado_a')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('asunto', 160);
            $table->string('prioridad', 10)->default('media');
            $table->string('estado', 20)->default('abierto');
            $table->boolean('pendiente_respuesta')->default(true);
            $table->timestamp('primera_respuesta')->nullable();
            $table->timestamp('resuelto_en')->nullable();
            $table->timestamp('cerrado_en')->nullable();
            $table->timestamps();

            $table->index(['estado', 'updated_at']);
            $table->index(['empresa_id', 'estado']);
        });

        Schema::create('mensajes_ticket', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->text('mensaje');
            $table->boolean('interno')->default(false);
            $table->timestamps();
        });

        Schema::create('adjuntos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('mensaje_ticket_id')->constrained('mensajes_ticket')->cascadeOnDelete();
            $table->string('nombre', 200);
            $table->string('ruta', 255);
            $table->string('tipo', 100);
            $table->unsignedInteger('tamano');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adjuntos');
        Schema::dropIfExists('mensajes_ticket');
        Schema::dropIfExists('tickets');
    }
};
