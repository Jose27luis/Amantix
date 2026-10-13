<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('noticias', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('slug', 140)->unique();
            $table->string('titulo', 160);
            $table->string('resumen', 300);
            $table->longText('contenido');
            $table->string('imagen', 80);
            $table->unsignedSmallInteger('imagen_ancho');
            $table->unsignedSmallInteger('imagen_alto');
            $table->string('estado', 12)->default('borrador');
            $table->timestamp('publicada_en')->nullable();
            $table->timestamps();

            $table->index(['estado', 'publicada_en']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('noticias');
    }
};
