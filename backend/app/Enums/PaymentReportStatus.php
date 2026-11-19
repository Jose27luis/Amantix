<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentReportStatus: string
{
    case EnRevision = 'en_revision';
    case Aceptado = 'aceptado';
    case Rechazado = 'rechazado';
}
