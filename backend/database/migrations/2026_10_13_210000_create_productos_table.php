<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('codigo', 40);
            $table->string('sistema', 40);
            $table->string('nombre', 120);
            $table->string('descripcion_corta', 255);
            $table->text('descripcion');
            $table->string('imagen', 255);
            $table->string('imagen_hero', 255);
            $table->json('funcionalidades');
            $table->json('capturas');
            $table->string('url_produccion', 255);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
