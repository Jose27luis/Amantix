<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case Yape = 'yape';
    case Plin = 'plin';
    case Transferencia = 'transferencia';
    case Deposito = 'deposito';
    case Efectivo = 'efectivo';
    case Otro = 'otro';
}
