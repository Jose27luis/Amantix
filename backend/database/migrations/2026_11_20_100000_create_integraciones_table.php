<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integraciones', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 80);
            $table->foreignId('producto_id')->constrained('productos')->restrictOnDelete();
            $table->string('prefijo_cuenta', 20);
            $table->char('token_hash', 64)->unique();
            $table->string('token_inicio', 12);
            $table->boolean('activo')->default(true);
            $table->dateTime('ultimo_uso_at')->nullable();
            $table->timestamps();
        });

        Schema::table('pagos_cobranza', function (Blueprint $table): void {
            $table->string('reportado_nombre', 120)->nullable()->after('reportado_por');
            $table->foreignId('integracion_id')->nullable()->after('reportado_nombre')->constrained('integraciones')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pagos_cobranza', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('integracion_id');
            $table->dropColumn('reportado_nombre');
        });

        Schema::dropIfExists('integraciones');
    }
};
