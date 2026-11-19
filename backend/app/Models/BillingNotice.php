<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingNotice extends Model
{
    public const CANAL_WHATSAPP = 'whatsapp';

    protected $table = 'avisos_cobranza';

    protected $fillable = [
        'cuenta_id',
        'canal',
        'dia_relativo',
        'enviado_por',
    ];

    protected function casts(): array
    {
        return [
            'dia_relativo' => 'integer',
        ];
    }

    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(Receivable::class, 'cuenta_id');
    }

    public function enviadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enviado_por');
    }
}
