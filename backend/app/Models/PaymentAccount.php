<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentAccount extends Model
{
    protected $table = 'metodos_pago';

    protected $fillable = [
        'nombre',
        'tipo',
        'titular',
        'numero',
        'cci',
        'instrucciones',
        'qr_ruta',
        'activo',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'tipo' => PaymentMethod::class,
            'activo' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(PaymentReport::class, 'metodo_pago_id');
    }
}
