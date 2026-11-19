<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metodos_pago', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 80);
            $table->string('tipo', 20);
            $table->string('titular', 160)->nullable();
            $table->string('numero', 40)->nullable();
            $table->string('cci', 30)->nullable();
            $table->string('instrucciones', 255)->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::table('pagos_cobranza', function (Blueprint $table): void {
            $table->foreignId('metodo_pago_id')->nullable()->after('metodo')->constrained('metodos_pago')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pagos_cobranza', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('metodo_pago_id');
        });

        Schema::dropIfExists('metodos_pago');
    }
};
