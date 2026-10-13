<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BillingPeriod;
use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $table = 'suscripciones';

    protected $fillable = [
        'empresa_id',
        'producto_id',
        'plan_id',
        'precio',
        'periodo',
        'fecha_alta',
        'proxima_renovacion',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'periodo' => BillingPeriod::class,
            'fecha_alta' => 'date',
            'proxima_renovacion' => 'date',
            'estado' => SubscriptionStatus::class,
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'empresa_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'producto_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function montoMensual(): float
    {
        return round((float) $this->precio / $this->periodo->meses(), 2);
    }
}
