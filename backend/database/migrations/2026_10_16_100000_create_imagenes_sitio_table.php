<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imagenes_sitio', function (Blueprint $table): void {
            $table->id();
            $table->string('ubicacion', 80);
            $table->string('titulo', 160);
            $table->string('archivo', 80);
            $table->unsignedSmallInteger('ancho');
            $table->unsignedSmallInteger('alto');
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();

            $table->index(['ubicacion', 'visible', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imagenes_sitio');
    }
};
