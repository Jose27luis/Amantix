<?php

declare(strict_types=1);

namespace App\Enums;

enum BillingPeriod: string
{
    case Mensual = 'mensual';
    case Anual = 'anual';

    public function meses(): int
    {
        return match ($this) {
            self::Mensual => 1,
            self::Anual => 12,
        };
    }
}
