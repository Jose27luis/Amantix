<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suscripciones', function (Blueprint $table): void {
            $table->unsignedTinyInteger('dia_cobro')->nullable()->after('periodo');
            $table->boolean('avisar')->default(true)->after('dia_cobro');
        });

        Schema::create('ajustes', function (Blueprint $table): void {
            $table->id();
            $table->string('clave', 80)->unique();
            $table->json('valor');
            $table->timestamps();
        });

        Schema::create('avisos_cobranza', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cuenta_id')->constrained('cuentas_por_cobrar')->cascadeOnDelete();
            $table->string('canal', 20);
            $table->smallInteger('dia_relativo');
            $table->foreignId('enviado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamps();

            $table->index(['cuenta_id', 'dia_relativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avisos_cobranza');
        Schema::dropIfExists('ajustes');

        Schema::table('suscripciones', function (Blueprint $table): void {
            $table->dropColumn(['dia_cobro', 'avisar']);
        });
    }
};
