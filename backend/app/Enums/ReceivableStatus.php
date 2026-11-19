<?php

declare(strict_types=1);

namespace App\Enums;

enum ReceivableStatus: string
{
    case Pendiente = 'pendiente';
    case EnRevision = 'en_revision';
    case Pagada = 'pagada';
    case Anulada = 'anulada';

    public function cobrable(): bool
    {
        return $this === self::Pendiente || $this === self::EnRevision;
    }
}
