<?php

declare(strict_types=1);

namespace App\Enums;

enum LeadSource: string
{
    case Contacto = 'contacto';
    case Demo = 'demo';
    case Cotizacion = 'cotizacion';
}
