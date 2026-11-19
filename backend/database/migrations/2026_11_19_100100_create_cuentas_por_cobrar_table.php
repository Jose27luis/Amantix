<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuentas_por_cobrar', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->restrictOnDelete();
            $table->foreignId('suscripcion_id')->nullable()->constrained('suscripciones')->nullOnDelete();
            $table->string('concepto', 255);
            $table->date('periodo_inicio')->nullable();
            $table->date('periodo_fin')->nullable();
            $table->decimal('monto', 10, 2);
            $table->date('vence');
            $table->string('estado', 20)->default('pendiente');
            $table->string('origen', 20)->default('automatica');
            $table->foreignId('creado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->dateTime('pagada_at')->nullable();
            $table->string('motivo_anulacion', 255)->nullable();
            $table->timestamps();

            $table->unique(['suscripcion_id', 'periodo_inicio']);
            $table->index(['estado', 'vence']);
        });

        Schema::create('pagos_cobranza', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cuenta_id')->constrained('cuentas_por_cobrar')->cascadeOnDelete();
            $table->foreignId('empresa_id')->constrained('empresas')->restrictOnDelete();
            $table->decimal('monto', 10, 2);
            $table->string('metodo', 20);
            $table->string('numero_operacion', 60)->nullable();
            $table->date('fecha_pago');
            $table->string('captura_ruta', 255)->nullable();
            $table->string('captura_tipo', 80)->nullable();
            $table->string('origen', 20);
            $table->foreignId('reportado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('estado', 20)->default('en_revision');
            $table->string('motivo_rechazo', 255)->nullable();
            $table->foreignId('revisado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->dateTime('revisado_at')->nullable();
            $table->timestamps();

            $table->index(['estado', 'created_at']);
        });

        Schema::create('comprobantes_cobranza', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cuenta_id')->unique()->constrained('cuentas_por_cobrar')->cascadeOnDelete();
            $table->foreignId('empresa_id')->constrained('empresas')->restrictOnDelete();
            $table->string('tipo', 2);
            $table->string('numero', 30)->nullable();
            $table->decimal('total', 10, 2);
            $table->string('estado', 20)->default('pendiente');
            $table->string('estado_sunat', 80)->nullable();
            $table->string('external_id', 80)->nullable();
            $table->string('pdf_url', 255)->nullable();
            $table->string('xml_url', 255)->nullable();
            $table->string('error', 500)->nullable();
            $table->dateTime('emitido_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobantes_cobranza');
        Schema::dropIfExists('pagos_cobranza');
        Schema::dropIfExists('cuentas_por_cobrar');
    }
};
