<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integration extends Model
{
    protected $table = 'integraciones';

    protected $fillable = [
        'nombre',
        'producto_id',
        'prefijo_cuenta',
        'token_hash',
        'token_inicio',
        'activo',
        'ultimo_uso_at',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'ultimo_uso_at' => 'datetime',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'producto_id');
    }

    public function cuentaExterna(string $cuenta): string
    {
        return $this->prefijo_cuenta.':'.$cuenta;
    }
}
