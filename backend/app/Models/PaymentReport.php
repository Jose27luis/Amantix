<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentReportStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReport extends Model
{
    public const ORIGEN_PORTAL = 'portal';
    public const ORIGEN_ADMINISTRADOR = 'administrador';
    public const ORIGEN_SISTEMA = 'sistema';

    protected $table = 'pagos_cobranza';

    protected $fillable = [
        'cuenta_id',
        'empresa_id',
        'monto',
        'metodo',
        'numero_operacion',
        'fecha_pago',
        'captura_ruta',
        'captura_tipo',
        'origen',
        'reportado_por',
        'estado',
        'motivo_rechazo',
        'revisado_por',
        'revisado_at',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'metodo' => PaymentMethod::class,
            'fecha_pago' => 'date',
            'estado' => PaymentReportStatus::class,
            'revisado_at' => 'datetime',
        ];
    }

    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(Receivable::class, 'cuenta_id');
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'empresa_id');
    }

    public function reportadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reportado_por');
    }

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }
}
