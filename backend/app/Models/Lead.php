<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    protected $table = 'leads';

    protected $fillable = [
        'codigo',
        'producto_id',
        'asignado_a',
        'empresa_id',
        'nombre',
        'empresa',
        'correo',
        'telefono',
        'mensaje',
        'origen',
        'estado',
        'motivo_perdida',
        'ip',
    ];

    protected $hidden = [
        'ip',
    ];

    protected function casts(): array
    {
        return [
            'origen' => LeadSource::class,
            'estado' => LeadStatus::class,
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'producto_id');
    }

    public function asignado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }

    public function empresaCliente(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'empresa_id');
    }

    public function notas(): HasMany
    {
        return $this->hasMany(LeadNote::class, 'lead_id')->latest();
    }
}
