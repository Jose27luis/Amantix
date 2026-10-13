<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BillingPeriod;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'planes';

    protected $fillable = [
        'nombre',
        'precio',
        'periodo',
        'descripcion',
        'caracteristicas',
        'destacado',
        'orden',
        'visible',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'periodo' => BillingPeriod::class,
            'caracteristicas' => 'array',
            'destacado' => 'boolean',
            'orden' => 'integer',
            'visible' => 'boolean',
        ];
    }
}
