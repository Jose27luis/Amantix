<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketMessage extends Model
{
    protected $table = 'mensajes_ticket';

    protected $fillable = [
        'ticket_id',
        'usuario_id',
        'mensaje',
        'interno',
    ];

    protected function casts(): array
    {
        return [
            'interno' => 'boolean',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function adjuntos(): HasMany
    {
        return $this->hasMany(Attachment::class, 'mensaje_ticket_id');
    }
}
