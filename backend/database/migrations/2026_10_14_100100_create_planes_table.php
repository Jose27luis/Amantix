<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planes', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 80);
            $table->decimal('precio', 10, 2);
            $table->string('periodo', 10)->default('mensual');
            $table->string('descripcion', 255);
            $table->json('caracteristicas');
            $table->boolean('destacado')->default(false);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planes');
    }
};
