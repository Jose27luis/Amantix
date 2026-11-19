<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentApplication extends Model
{
    protected $table = 'aplicaciones_pago';

    protected $fillable = [
        'pago_id',
        'cuenta_id',
        'monto',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
        ];
    }

    public function pago(): BelongsTo
    {
        return $this->belongsTo(PaymentReport::class, 'pago_id');
    }

    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(Receivable::class, 'cuenta_id');
    }
}
