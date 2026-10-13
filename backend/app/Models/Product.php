<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'slug',
        'codigo',
        'sistema',
        'nombre',
        'descripcion_corta',
        'descripcion',
        'imagen',
        'imagen_hero',
        'funcionalidades',
        'capturas',
        'url_produccion',
        'orden',
        'visible',
    ];

    protected function casts(): array
    {
        return [
            'funcionalidades' => 'array',
            'capturas' => 'array',
            'orden' => 'integer',
            'visible' => 'boolean',
        ];
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'producto_id');
    }
}
