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
use Carbon\CarbonImmutable;

class SubscriptionService
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function crear(Company $empresa, array $datos, User $autor): Subscription
    {
        $plan = Plan::query()->findOrFail((int) $datos['plan_id']);
        $periodo = isset($datos['periodo']) ? BillingPeriod::from($datos['periodo']) : $plan->periodo;
        $alta = CarbonImmutable::parse($datos['fecha_alta'] ?? now()->toDateString());

        $suscripcion = $empresa->suscripciones()->create([
            'producto_id' => (int) $datos['producto_id'],
            'plan_id' => $plan->id,
            'precio' => $datos['precio'] ?? $plan->precio,
            'periodo' => $periodo,
            'fecha_alta' => $alta->toDateString(),
            'proxima_renovacion' => $datos['proxima_renovacion'] ?? $alta->addMonthsNoOverflow($periodo->meses())->toDateString(),
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

        $suscripcion->fill(array_intersect_key($datos, array_flip(['precio', 'periodo', 'proxima_renovacion', 'estado'])));
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
