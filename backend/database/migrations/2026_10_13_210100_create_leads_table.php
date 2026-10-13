<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table): void {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->foreignId('asignado_a')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('nombre', 120);
            $table->string('empresa', 160)->nullable();
            $table->string('correo', 160);
            $table->string('telefono', 30)->nullable();
            $table->text('mensaje');
            $table->string('origen', 20);
            $table->string('estado', 20)->default('nuevo');
            $table->string('motivo_perdida', 255)->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->index(['estado', 'created_at']);
            $table->index('created_at');
        });

        Schema::create('notas_lead', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->text('nota');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_lead');
        Schema::dropIfExists('leads');
    }
};
