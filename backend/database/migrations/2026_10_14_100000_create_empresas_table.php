<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table): void {
            $table->id();
            $table->string('razon_social', 200);
            $table->string('ruc', 11)->unique();
            $table->string('rubro', 120)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->string('contacto', 120)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('correo', 160)->nullable();
            $table->timestamps();
        });

        Schema::table('usuarios', function (Blueprint $table): void {
            $table->foreignId('empresa_id')->nullable()->after('id')->constrained('empresas')->restrictOnDelete();
        });

        Schema::table('leads', function (Blueprint $table): void {
            $table->foreignId('empresa_id')->nullable()->after('asignado_a')->constrained('empresas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('empresa_id');
        });

        Schema::table('usuarios', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('empresa_id');
        });

        Schema::dropIfExists('empresas');
    }
};
