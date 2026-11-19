<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentReportStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PaymentReport extends Model
{
    public const ORIGEN_PORTAL = 'portal';
    public const ORIGEN_ADMINISTRADOR = 'administrador';
    public const ORIGEN_SISTEMA = 'sistema';

    protected $table = 'pagos_cobranza';

    protected $fillable = [
        'clave_idempotencia',
        'cuenta_id',
        'empresa_id',
        'monto',
        'monto_reportado',
        'metodo',
        'metodo_pago_id',
        'numero_operacion',
        'operacion_activa',
        'fecha_pago',
        'captura_ruta',
        'captura_tipo',
        'origen',
        'reportado_por',
        'reportado_nombre',
        'integracion_id',
        'estado',
        'motivo_rechazo',
        'revisado_por',
        'revisado_at',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'monto_reportado' => 'decimal:2',
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

    public function metodoPago(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class, 'metodo_pago_id');
    }

    public function aplicaciones(): HasMany
    {
        return $this->hasMany(PaymentApplication::class, 'pago_id');
    }

    public function comprobante(): HasOne
    {
        return $this->hasOne(BillingInvoice::class, 'pago_id');
    }

    public function integracion(): BelongsTo
    {
        return $this->belongsTo(Integration::class, 'integracion_id');
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
