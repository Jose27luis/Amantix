<?php

declare(strict_types=1);

namespace App\Enums;

enum TicketStatus: string
{
    case Abierto = 'abierto';
    case EnAtencion = 'en_atencion';
    case Esperando = 'esperando';
    case Resuelto = 'resuelto';
    case Cerrado = 'cerrado';

    public static function activos(): array
    {
        return [self::Abierto, self::EnAtencion, self::Esperando];
    }
}
