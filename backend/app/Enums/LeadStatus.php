<?php

declare(strict_types=1);

namespace App\Enums;

enum LeadStatus: string
{
    case Nuevo = 'nuevo';
    case Contactado = 'contactado';
    case Demo = 'demo';
    case Propuesta = 'propuesta';
    case Ganado = 'ganado';
    case Perdido = 'perdido';
}
