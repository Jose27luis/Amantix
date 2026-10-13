<?php

declare(strict_types=1);

namespace App\Enums;

enum SubscriptionStatus: string
{
    case Activa = 'activa';
    case Suspendida = 'suspendida';
    case Baja = 'baja';
}
