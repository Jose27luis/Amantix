<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\ReceivableStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Receivable;
use App\Models\Subscription;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class ReceivableGenerator
{
    public function __construct(
        private readonly BillingConcept $concepto,
        private readonly BillingSettings $ajustes,
        private readonly BillingCalendar $calendario,
    ) {
    }

    public function generarPendientes(CarbonImmutable $hoy): int
    {
        $limite = $hoy->addDays($this->ajustes->diasAnticipacion());
        $creadas = 0;

        Subscription::query()
            ->with(['producto', 'plan'])
            ->where('estado', SubscriptionStatus::Activa)
            ->whereDate('proxima_renovacion', '<=', $limite->toDateString())
            ->orderBy('id')
            ->each(function (Subscription $suscripcion) use ($limite, &$creadas): void {
                $creadas += $this->generarHasta($suscripcion, $limite);
            });

        return $creadas;
    }

    private function generarHasta(Subscription $suscripcion, CarbonImmutable $limite): int
    {
        $creadas = 0;

        while (CarbonImmutable::parse($suscripcion->proxima_renovacion)->lessThanOrEqualTo($limite)) {
            DB::transaction(function () use ($suscripcion, &$creadas): void {
                $inicio = CarbonImmutable::parse($suscripcion->proxima_renovacion);
                $siguiente = $this->calendario->siguiente($inicio, $suscripcion->periodo->meses(), $suscripcion->dia_cobro);
                $fin = $siguiente->subDay();

                $cuenta = Receivable::query()->firstOrCreate(
                    ['suscripcion_id' => $suscripcion->id, 'periodo_inicio' => $inicio->toDateString()],
                    [
                        'empresa_id' => $suscripcion->empresa_id,
                        'concepto' => $this->concepto->para($suscripcion, $inicio, $fin),
                        'periodo_fin' => $fin->toDateString(),
                        'monto' => $suscripcion->precio,
                        'vence' => $inicio->toDateString(),
                        'estado' => ReceivableStatus::Pendiente,
                        'origen' => Receivable::ORIGEN_AUTOMATICA,
                    ],
                );

                if ($cuenta->wasRecentlyCreated) {
                    $creadas++;
                }

                $suscripcion->proxima_renovacion = $siguiente->toDateString();
                $suscripcion->save();
            });
        }

        return $creadas;
    }
}
