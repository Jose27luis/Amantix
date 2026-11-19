<?php

declare(strict_types=1);

namespace App\Services\Subscriptions;

use App\Enums\BillingPeriod;
use App\Enums\SubscriptionStatus;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use App\Services\Billing\BillingCalendar;
use Carbon\CarbonImmutable;

class SubscriptionService
{
    public function __construct(
        private readonly AuditRecorder $auditoria,
        private readonly BillingCalendar $calendario,
    ) {
    }

    public function crear(Company $empresa, array $datos, User $autor): Subscription
    {
        $plan = Plan::query()->findOrFail((int) $datos['plan_id']);
        $periodo = isset($datos['periodo']) ? BillingPeriod::from($datos['periodo']) : $plan->periodo;
        $alta = CarbonImmutable::parse($datos['fecha_alta'] ?? now()->toDateString());
        $dia = isset($datos['dia_cobro']) ? (int) $datos['dia_cobro'] : null;
        $proxima = isset($datos['proxima_renovacion'])
            ? CarbonImmutable::parse($datos['proxima_renovacion'])
            : $this->calendario->conDia($alta->startOfMonth()->addMonthsNoOverflow($periodo->meses()), $dia ?? $alta->day);

        $suscripcion = $empresa->suscripciones()->create([
            'producto_id' => (int) $datos['producto_id'],
            'plan_id' => $plan->id,
            'precio' => $datos['precio'] ?? $plan->precio,
            'concepto' => $datos['concepto'] ?? null,
            'cuenta_externa' => $datos['cuenta_externa'] ?? null,
            'periodo' => $periodo,
            'dia_cobro' => $dia ?? $proxima->day,
            'avisar' => (bool) ($datos['avisar'] ?? true),
            'fecha_alta' => $alta->toDateString(),
            'proxima_renovacion' => $proxima->toDateString(),
            'estado' => SubscriptionStatus::Activa,
        ]);

        $this->auditoria->registrar($autor, 'suscripcion_creada', $suscripcion, [
            'empresa_id' => $empresa->id,
            'plan' => $plan->nombre,
        ]);

        return $suscripcion;
    }

    public function actualizar(Subscription $suscripcion, array $datos, User $autor): Subscription
    {
        $anterior = $suscripcion->estado;

        if (isset($datos['plan_id'])) {
            $suscripcion->plan_id = (int) $datos['plan_id'];
        }

        $suscripcion->fill(array_intersect_key($datos, array_flip(['precio', 'concepto', 'cuenta_externa', 'periodo', 'dia_cobro', 'avisar', 'proxima_renovacion', 'estado'])));

        if ($suscripcion->isDirty('dia_cobro') && ! isset($datos['proxima_renovacion']) && $suscripcion->dia_cobro !== null) {
            $suscripcion->proxima_renovacion = $this->calendario
                ->conDia(CarbonImmutable::parse($suscripcion->proxima_renovacion)->startOfMonth(), $suscripcion->dia_cobro)
                ->toDateString();
        }

        $cambios = array_keys($suscripcion->getDirty());
        $suscripcion->save();

        if ($cambios === []) {
            return $suscripcion;
        }

        $detalle = ['campos' => $cambios];
        if ($suscripcion->estado !== $anterior) {
            $detalle['de'] = $anterior->value;
            $detalle['a'] = $suscripcion->estado->value;
        }

        $this->auditoria->registrar($autor, 'suscripcion_actualizada', $suscripcion, $detalle);

        return $suscripcion;
    }
}
