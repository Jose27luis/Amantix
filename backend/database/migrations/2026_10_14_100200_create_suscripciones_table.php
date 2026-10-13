<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suscripciones', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos')->restrictOnDelete();
            $table->foreignId('plan_id')->constrained('planes')->restrictOnDelete();
            $table->decimal('precio', 10, 2);
            $table->string('periodo', 10);
            $table->date('fecha_alta');
            $table->date('proxima_renovacion');
            $table->string('estado', 20)->default('activa');
            $table->timestamps();

            $table->index(['estado', 'proxima_renovacion']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suscripciones');
    }
};
