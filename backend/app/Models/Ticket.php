<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    public const DIAS_PARA_REABRIR = 7;

    protected $table = 'tickets';

    protected $fillable = [
        'codigo',
        'empresa_id',
        'producto_id',
        'creado_por',
        'asignado_a',
        'asunto',
        'prioridad',
        'estado',
        'pendiente_respuesta',
        'primera_respuesta',
        'resuelto_en',
        'cerrado_en',
    ];

    protected function casts(): array
    {
        return [
            'prioridad' => TicketPriority::class,
            'estado' => TicketStatus::class,
            'pendiente_respuesta' => 'boolean',
            'primera_respuesta' => 'datetime',
            'resuelto_en' => 'datetime',
            'cerrado_en' => 'datetime',
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

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function asignado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(TicketMessage::class, 'ticket_id');
    }

    public function puedeReabrirse(): bool
    {
        return $this->estado === TicketStatus::Resuelto
            && $this->resuelto_en !== null
            && $this->resuelto_en->greaterThan(now()->subDays(self::DIAS_PARA_REABRIR));
    }
}
