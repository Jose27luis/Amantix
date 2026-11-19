<?php

declare(strict_types=1);

namespace App\Services\Billing;

use Carbon\CarbonImmutable;

class BillingCalendar
{
    public function conDia(CarbonImmutable $fecha, ?int $dia): CarbonImmutable
    {
        if ($dia === null) {
            return $fecha;
        }

        return $fecha->setDay(min($dia, $fecha->daysInMonth));
    }

    public function siguiente(CarbonImmutable $vence, int $meses, ?int $dia): CarbonImmutable
    {
        return $this->conDia($vence->startOfMonth()->addMonthsNoOverflow($meses), $dia ?? $vence->day);
    }

    public function alinear(CarbonImmutable $fecha, int $dia): CarbonImmutable
    {
        $candidatos = [
            $this->conDia($fecha->startOfMonth()->subMonthNoOverflow(), $dia),
            $this->conDia($fecha->startOfMonth(), $dia),
            $this->conDia($fecha->startOfMonth()->addMonthNoOverflow(), $dia),
        ];

        usort($candidatos, static fn (CarbonImmutable $a, CarbonImmutable $b): int => abs($a->diffInDays($fecha)) <=> abs($b->diffInDays($fecha)));

        return $candidatos[0];
    }
}
