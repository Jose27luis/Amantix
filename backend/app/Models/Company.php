<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $table = 'empresas';

    protected $fillable = [
        'razon_social',
        'ruc',
        'rubro',
        'direccion',
        'contacto',
        'telefono',
        'correo',
    ];

    public function suscripciones(): HasMany
    {
        return $this->hasMany(Subscription::class, 'empresa_id');
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'empresa_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'empresa_id');
    }
}
