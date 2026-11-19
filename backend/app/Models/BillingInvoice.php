<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingInvoice extends Model
{
    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_EMITIDO = 'emitido';
    public const ESTADO_ERROR = 'error';

    public const TIPO_FACTURA = '01';
    public const TIPO_BOLETA = '03';

    protected $table = 'comprobantes_cobranza';

    protected $fillable = [
        'pago_id',
        'cuenta_id',
        'empresa_id',
        'tipo',
        'numero',
        'total',
        'estado',
        'estado_sunat',
        'external_id',
        'pdf_url',
        'xml_url',
        'error',
        'emitido_at',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'emitido_at' => 'datetime',
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
