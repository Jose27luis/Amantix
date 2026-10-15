<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SiteImageLocation;
use Illuminate\Database\Eloquent\Model;

class SiteImage extends Model
{
    protected $table = 'imagenes_sitio';

    protected $fillable = [
        'ubicacion',
        'titulo',
        'archivo',
        'ancho',
        'alto',
        'orden',
        'visible',
    ];

    protected function casts(): array
    {
        return [
            'ubicacion' => SiteImageLocation::class,
            'ancho' => 'integer',
            'alto' => 'integer',
            'orden' => 'integer',
            'visible' => 'boolean',
        ];
    }
}
