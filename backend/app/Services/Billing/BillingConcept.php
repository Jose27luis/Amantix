<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\BillingPeriod;
use App\Models\Subscription;
use Carbon\CarbonImmutable;

class BillingConcept
{
    private const MESES = [
        1 => 'enero',
        2 => 'febrero',
        3 => 'marzo',
        4 => 'abril',
        5 => 'mayo',
        6 => 'junio',
        7 => 'julio',
        8 => 'agosto',
        9 => 'septiembre',
        10 => 'octubre',
        11 => 'noviembre',
        12 => 'diciembre',
    ];

    public function para(Subscription $suscripcion, CarbonImmutable $inicio, CarbonImmutable $fin): string
    {
        $base = trim((string) $suscripcion->concepto);
        if ($base === '') {
            $base = mb_strtoupper("Servicio {$suscripcion->producto->nombre}, plan {$suscripcion->plan->nombre}");
        }

        return mb_strtoupper("{$base} {$this->periodo($suscripcion->periodo, $inicio, $fin)}");
    }

    private function periodo(BillingPeriod $periodo, CarbonImmutable $inicio, CarbonImmutable $fin): string
    {
        if ($periodo === BillingPeriod::Mensual) {
            return 'correspondiente al mes de '.$this->mes($inicio);
        }

        return 'del '.$inicio->format('d/m/Y').' al '.$fin->format('d/m/Y');
    }

    private function mes(CarbonImmutable $fecha): string
    {
        return self::MESES[$fecha->month].' del '.$fecha->year;
    }
}
