<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('imagenes_sitio', function (Blueprint $table): void {
            $table->string('seccion', 20)->default('galeria')->after('ubicacion');
        });
    }

    public function down(): void
    {
        Schema::table('imagenes_sitio', function (Blueprint $table): void {
            $table->dropColumn('seccion');
        });
    }
};
