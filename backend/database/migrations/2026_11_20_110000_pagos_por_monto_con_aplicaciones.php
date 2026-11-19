<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cuentas_por_cobrar', function (Blueprint $table): void {
            $table->decimal('monto_pagado', 10, 2)->default(0)->after('monto');
        });

        Schema::table('pagos_cobranza', function (Blueprint $table): void {
            $table->foreignId('cuenta_id')->nullable()->change();
            $table->string('clave_idempotencia', 80)->nullable()->after('id');
            $table->string('operacion_activa', 120)->nullable()->after('numero_operacion');
            $table->decimal('monto_reportado', 10, 2)->nullable()->after('monto');
            $table->unique('clave_idempotencia');
            $table->unique('operacion_activa');
            $table->index(['empresa_id', 'estado']);
        });

        Schema::create('aplicaciones_pago', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pago_id')->constrained('pagos_cobranza')->restrictOnDelete();
            $table->foreignId('cuenta_id')->constrained('cuentas_por_cobrar')->restrictOnDelete();
            $table->decimal('monto', 10, 2);
            $table->timestamps();

            $table->unique(['pago_id', 'cuenta_id']);
            $table->index('cuenta_id');
        });

        Schema::table('comprobantes_cobranza', function (Blueprint $table): void {
            $table->dropForeign(['cuenta_id']);
            $table->dropUnique(['cuenta_id']);
        });

        Schema::table('comprobantes_cobranza', function (Blueprint $table): void {
            $table->foreignId('cuenta_id')->nullable()->change();
            $table->foreign('cuenta_id')->references('id')->on('cuentas_por_cobrar')->nullOnDelete();
            $table->foreignId('pago_id')->nullable()->after('id')->constrained('pagos_cobranza')->restrictOnDelete();
            $table->unique('pago_id');
        });

        Schema::table('metodos_pago', function (Blueprint $table): void {
            $table->string('qr_ruta', 255)->nullable()->after('instrucciones');
        });
    }

    public function down(): void
    {
        Schema::table('metodos_pago', function (Blueprint $table): void {
            $table->dropColumn('qr_ruta');
        });

        Schema::table('comprobantes_cobranza', function (Blueprint $table): void {
            $table->dropUnique(['pago_id']);
            $table->dropConstrainedForeignId('pago_id');
        });

        Schema::dropIfExists('aplicaciones_pago');

        Schema::table('pagos_cobranza', function (Blueprint $table): void {
            $table->dropIndex(['empresa_id', 'estado']);
            $table->dropUnique(['operacion_activa']);
            $table->dropUnique(['clave_idempotencia']);
            $table->dropColumn(['clave_idempotencia', 'operacion_activa', 'monto_reportado']);
        });

        Schema::table('cuentas_por_cobrar', function (Blueprint $table): void {
            $table->dropColumn('monto_pagado');
        });
    }
};
