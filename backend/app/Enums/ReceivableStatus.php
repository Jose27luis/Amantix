<?php

declare(strict_types=1);

namespace App\Enums;

enum ReceivableStatus: string
{
    case Pendiente = 'pendiente';
    case Parcial = 'parcial';
    case EnRevision = 'en_revision';
    case Pagada = 'pagada';
    case Anulada = 'anulada';

    public function cobrable(): bool
    {
        return in_array($this, self::cobrables(), true);
    }

    public static function cobrables(): array
    {
        return [self::Pendiente, self::Parcial, self::EnRevision];
    }
}
