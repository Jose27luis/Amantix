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
            $table->string('concepto', 200)->nullable()->after('precio');
            $table->string('cuenta_externa', 120)->nullable()->after('concepto');
            $table->index('cuenta_externa');
        });
    }

    public function down(): void
    {
        Schema::table('suscripciones', function (Blueprint $table): void {
            $table->dropIndex(['cuenta_externa']);
            $table->dropColumn(['concepto', 'cuenta_externa']);
        });
    }
};
