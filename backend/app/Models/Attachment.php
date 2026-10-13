<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    protected $table = 'adjuntos';

    protected $fillable = [
        'mensaje_ticket_id',
        'nombre',
        'ruta',
        'tipo',
        'tamano',
    ];

    protected $hidden = [
        'ruta',
    ];

    protected function casts(): array
    {
        return [
            'tamano' => 'integer',
        ];
    }

    public function mensaje(): BelongsTo
    {
        return $this->belongsTo(TicketMessage::class, 'mensaje_ticket_id');
    }
}
