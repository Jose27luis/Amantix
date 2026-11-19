<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\PaymentReportStatus;
use App\Enums\ReceivableStatus;
use App\Enums\SubscriptionStatus;
use App\Models\BillingInvoice;
use App\Models\Integration;
use App\Models\PaymentAccount;
use App\Models\PaymentApplication;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\Subscription;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;

class IntegrationStatement
{
    public function suscripcion(Integration $integracion, string $cuenta): ?Subscription
    {
        return Subscription::query()
            ->with(['empresa', 'plan', 'producto'])
            ->where('producto_id', $integracion->producto_id)
            ->where('cuenta_externa', $integracion->cuentaExterna($cuenta))
            ->orderByRaw("FIELD(estado, 'activa', 'suspendida', 'baja')")
            ->latest('id')
            ->first();
    }

    public function estado(?Subscription $suscripcion, CarbonImmutable $hoy): array
    {
        if ($suscripcion === null) {
            return ['vinculada' => false, 'actualizado' => now()->toIso8601String()];
        }

        $empresaId = $suscripcion->empresa_id;

        $porPagar = Receivable::query()
            ->where('empresa_id', $empresaId)
            ->whereIn('estado', ReceivableStatus::cobrables())
            ->orderBy('vence')
            ->orderBy('id')
            ->get();

        $pagadas = Receivable::query()
            ->with('aplicaciones.pago.comprobante')
            ->where('empresa_id', $empresaId)
            ->where('estado', ReceivableStatus::Pagada)
            ->orderByDesc('pagada_at')
            ->limit(12)
            ->get();

        $pagos = PaymentReport::query()
            ->with(['metodoPago', 'comprobante'])
            ->where('empresa_id', $empresaId)
            ->latest()
            ->limit(20)
            ->get();

        $enRevision = $pagos->where('estado', PaymentReportStatus::EnRevision);
        $vencidas = $porPagar->filter(fn (Receivable $cuenta): bool => $cuenta->vence->lt($hoy));
        $deuda = round($porPagar->sum(fn (Receivable $cuenta): float => $cuenta->saldo()), 2);

        return [
            'vinculada' => true,
            'empresa' => [
                'razon_social' => $suscripcion->empresa->razon_social,
                'ruc' => $suscripcion->empresa->ruc,
            ],
            'suscripcion' => [
                'producto' => $suscripcion->producto?->nombre,
                'plan' => $suscripcion->plan?->nombre,
                'precio' => (float) $suscripcion->precio,
                'periodo' => $suscripcion->periodo->value,
                'dia_cobro' => $suscripcion->dia_cobro,
                'proximo_cobro' => $suscripcion->proxima_renovacion?->toDateString(),
                'estado' => $suscripcion->estado->value,
            ],
            'suspendida' => $suscripcion->estado === SubscriptionStatus::Suspendida,
            'deuda' => $deuda,
            'en_revision' => round((float) $enRevision->sum('monto'), 2),
            'cuentas_vencidas' => $vencidas->count(),
            'aviso' => $this->aviso($porPagar, $vencidas, $enRevision, $suscripcion, $hoy),
            'por_pagar' => $porPagar->map(fn (Receivable $cuenta): array => $this->cuenta($cuenta, $hoy, $pagos))->values()->all(),
            'pagadas' => $pagadas->map(fn (Receivable $cuenta): array => $this->cuenta($cuenta, $hoy, $pagos))->values()->all(),
            'pagos' => $pagos->map(fn (PaymentReport $pago): array => [
                'id' => $pago->id,
                'monto' => (float) $pago->monto,
                'metodo' => $pago->metodoPago?->nombre ?? $pago->metodo->value,
                'numero_operacion' => $pago->numero_operacion,
                'fecha_pago' => $pago->fecha_pago?->toDateString(),
                'estado' => $pago->estado->value,
                'motivo_rechazo' => $pago->motivo_rechazo,
                'comprobante' => $this->comprobante($pago->comprobante),
            ])->values()->all(),
            'metodos_pago' => PaymentAccount::query()
                ->where('activo', true)
                ->orderBy('orden')
                ->orderBy('id')
                ->get()
                ->map(fn (PaymentAccount $metodo): array => [
                    'id' => $metodo->id,
                    'nombre' => $metodo->nombre,
                    'tipo' => $metodo->tipo->value,
                    'titular' => $metodo->titular,
                    'numero' => $metodo->numero,
                    'cci' => $metodo->cci,
                    'instrucciones' => $metodo->instrucciones,
                    'qr_url' => PaymentQrStore::url($metodo),
                ])
                ->values()
                ->all(),
            'actualizado' => now()->toIso8601String(),
        ];
    }

    private function aviso(Collection $porPagar, Collection $vencidas, Collection $enRevision, Subscription $suscripcion, CarbonImmutable $hoy): ?array
    {
        if ($suscripcion->estado === SubscriptionStatus::Suspendida) {
            return [
                'nivel' => 'suspendida',
                'titulo' => 'Servicio suspendido',
                'mensaje' => 'Tu servicio está suspendido por falta de pago. Reporta tu pago para reactivarlo.',
            ];
        }

        $primera = $porPagar->first();
        if (! $primera instanceof Receivable) {
            return null;
        }

        $deuda = $porPagar->sum(fn (Receivable $cuenta): float => $cuenta->saldo());
        $revision = (float) $enRevision->sum('monto');

        if ($revision > 0 && $revision + 0.001 >= $deuda) {
            return [
                'nivel' => 'revision',
                'titulo' => 'Pago en revisión',
                'mensaje' => 'Recibimos tu pago de S/ '.number_format($revision, 2).'. Te avisaremos cuando lo confirmemos.',
            ];
        }

        $monto = 'S/ '.number_format($primera->saldo(), 2);
        $vence = $primera->vence->format('d/m/Y');

        if ($vencidas->isNotEmpty()) {
            $vencido = 'S/ '.number_format($vencidas->sum(fn (Receivable $cuenta): float => $cuenta->saldo()), 2);

            return [
                'nivel' => 'vencido',
                'titulo' => $vencidas->count() === 1 ? 'Tienes un pago vencido' : 'Tienes '.$vencidas->count().' pagos vencidos',
                'mensaje' => "Debes {$vencido} desde el {$vence}. Paga y sube tu comprobante para evitar la suspensión.",
            ];
        }

        $dias = (int) $hoy->diffInDays($primera->vence, false);

        return [
            'nivel' => 'pendiente',
            'titulo' => $dias === 0 ? 'Hoy vence tu pago' : 'Tienes un pago pendiente',
            'mensaje' => $dias === 0
                ? "Hoy vence tu pago de {$monto}. Paga y sube tu comprobante."
                : "Tu pago de {$monto} vence el {$vence}. Paga y sube tu comprobante.",
        ];
    }

    private function cuenta(Receivable $cuenta, CarbonImmutable $hoy, Collection $pagos): array
    {
        $propios = $pagos->where('cuenta_id', $cuenta->id);
        $enRevision = $propios->contains(fn (PaymentReport $pago): bool => $pago->estado === PaymentReportStatus::EnRevision);
        $rechazo = $propios->where('estado', PaymentReportStatus::Rechazado)->sortByDesc('id')->first();
        $aplicacion = $cuenta->relationLoaded('aplicaciones') ? $cuenta->aplicaciones->sortByDesc('id')->first() : null;

        return [
            'id' => $cuenta->id,
            'concepto' => $cuenta->concepto,
            'monto' => (float) $cuenta->monto,
            'monto_pagado' => (float) $cuenta->monto_pagado,
            'saldo' => $cuenta->saldo(),
            'vence' => $cuenta->vence->toDateString(),
            'vencida' => $cuenta->estado->cobrable() && $cuenta->vence->lt($hoy),
            'estado' => $cuenta->estado->cobrable() && $enRevision ? 'en_revision' : $cuenta->estado->value,
            'pagada_at' => $cuenta->pagada_at?->toIso8601String(),
            'ultimo_rechazo' => $rechazo instanceof PaymentReport && ! $enRevision && $cuenta->estado->cobrable()
                ? $rechazo->motivo_rechazo
                : null,
            'comprobante' => $aplicacion instanceof PaymentApplication ? $this->comprobante($aplicacion->pago?->comprobante) : null,
        ];
    }

    private function comprobante(?BillingInvoice $comprobante): ?array
    {
        return $comprobante instanceof BillingInvoice && $comprobante->estado === BillingInvoice::ESTADO_EMITIDO ? [
            'numero' => $comprobante->numero,
            'pdf_url' => $comprobante->pdf_url,
        ] : null;
    }
}
