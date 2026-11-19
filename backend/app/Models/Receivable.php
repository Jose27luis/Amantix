<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReceivableStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Receivable extends Model
{
    public const ORIGEN_AUTOMATICA = 'automatica';
    public const ORIGEN_MANUAL = 'manual';

    protected $table = 'cuentas_por_cobrar';

    protected $fillable = [
        'empresa_id',
        'suscripcion_id',
        'concepto',
        'periodo_inicio',
        'periodo_fin',
        'monto',
        'monto_pagado',
        'vence',
        'estado',
        'origen',
        'creado_por',
        'pagada_at',
        'motivo_anulacion',
    ];

    protected function casts(): array
    {
        return [
            'periodo_inicio' => 'date',
            'periodo_fin' => 'date',
            'monto' => 'decimal:2',
            'monto_pagado' => 'decimal:2',
            'vence' => 'date',
            'estado' => ReceivableStatus::class,
            'pagada_at' => 'datetime',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'empresa_id');
    }

    public function suscripcion(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'suscripcion_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(PaymentReport::class, 'cuenta_id');
    }

    public function comprobante(): HasOne
    {
        return $this->hasOne(BillingInvoice::class, 'cuenta_id');
    }

    public function aplicaciones(): HasMany
    {
        return $this->hasMany(PaymentApplication::class, 'cuenta_id');
    }

    public function saldo(): float
    {
        return round((float) $this->monto - (float) $this->monto_pagado, 2);
    }
}
