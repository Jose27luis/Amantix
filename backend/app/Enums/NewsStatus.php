<?php

declare(strict_types=1);

namespace App\Enums;

enum NewsStatus: string
{
    case Borrador = 'borrador';
    case Publicada = 'publicada';
}
