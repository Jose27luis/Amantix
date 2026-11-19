<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\PaymentReportStatus;
use App\Enums\ReceivableStatus;
use App\Enums\SubscriptionStatus;
use App\Models\BillingInvoice;
use App\Models\Integration;
use App\Models\PaymentAccount;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\Subscription;
use Carbon\CarbonImmutable;

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

        $porPagar = Receivable::query()
            ->with(['pagos.metodoPago', 'comprobante'])
            ->where('empresa_id', $suscripcion->empresa_id)
            ->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision])
            ->orderBy('vence')
            ->get();

        $pagadas = Receivable::query()
            ->with('comprobante')
            ->where('empresa_id', $suscripcion->empresa_id)
            ->where('estado', ReceivableStatus::Pagada)
            ->orderByDesc('pagada_at')
            ->limit(12)
            ->get();

        $vencidas = $porPagar->filter(fn (Receivable $cuenta): bool => $cuenta->vence->lt($hoy));

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
            'deuda' => round((float) $porPagar->sum('monto'), 2),
            'cuentas_vencidas' => $vencidas->count(),
            'aviso' => $this->aviso($porPagar->first(), $vencidas->count(), $suscripcion, $hoy),
            'por_pagar' => $porPagar->map(fn (Receivable $cuenta): array => $this->cuenta($cuenta, $hoy))->values()->all(),
            'pagadas' => $pagadas->map(fn (Receivable $cuenta): array => $this->cuenta($cuenta, $hoy))->values()->all(),
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
                ])
                ->values()
                ->all(),
            'actualizado' => now()->toIso8601String(),
        ];
    }

    private function aviso(?Receivable $cuenta, int $vencidas, Subscription $suscripcion, CarbonImmutable $hoy): ?array
    {
        if ($suscripcion->estado === SubscriptionStatus::Suspendida) {
            return [
                'nivel' => 'suspendida',
                'titulo' => 'Servicio suspendido',
                'mensaje' => 'Tu servicio está suspendido por falta de pago. Reporta tu pago para reactivarlo.',
            ];
        }

        if ($cuenta === null) {
            return null;
        }

        $monto = 'S/ '.number_format((float) $cuenta->monto, 2);
        $vence = $cuenta->vence->format('d/m/Y');

        if ($cuenta->estado === ReceivableStatus::EnRevision && $vencidas === 0) {
            return [
                'nivel' => 'revision',
                'titulo' => 'Pago en revisión',
                'mensaje' => "Recibimos tu pago de {$monto}. Te avisaremos cuando lo confirmemos.",
            ];
        }

        if ($vencidas > 0) {
            return [
                'nivel' => 'vencido',
                'titulo' => $vencidas === 1 ? 'Tienes un pago vencido' : "Tienes {$vencidas} pagos vencidos",
                'mensaje' => "Tu pago de {$monto} venció el {$vence}. Paga y sube tu comprobante para evitar la suspensión.",
            ];
        }

        $dias = (int) $hoy->diffInDays($cuenta->vence, false);

        return [
            'nivel' => 'pendiente',
            'titulo' => $dias === 0 ? 'Hoy vence tu pago' : 'Tienes un pago pendiente',
            'mensaje' => $dias === 0
                ? "Hoy vence tu pago de {$monto}. Paga y sube tu comprobante."
                : "Tu pago de {$monto} vence el {$vence}. Paga y sube tu comprobante.",
        ];
    }

    private function cuenta(Receivable $cuenta, CarbonImmutable $hoy): array
    {
        $rechazo = $cuenta->relationLoaded('pagos')
            ? $cuenta->pagos->where('estado', PaymentReportStatus::Rechazado)->sortByDesc('id')->first()
            : null;
        $comprobante = $cuenta->comprobante;

        return [
            'id' => $cuenta->id,
            'concepto' => $cuenta->concepto,
            'monto' => (float) $cuenta->monto,
            'vence' => $cuenta->vence->toDateString(),
            'vencida' => $cuenta->estado->cobrable() && $cuenta->vence->lt($hoy),
            'estado' => $cuenta->estado->value,
            'pagada_at' => $cuenta->pagada_at?->toIso8601String(),
            'ultimo_rechazo' => $rechazo instanceof PaymentReport && $cuenta->estado === ReceivableStatus::Pendiente
                ? $rechazo->motivo_rechazo
                : null,
            'comprobante' => $comprobante instanceof BillingInvoice && $comprobante->estado === BillingInvoice::ESTADO_EMITIDO ? [
                'numero' => $comprobante->numero,
                'pdf_url' => $comprobante->pdf_url,
            ] : null,
        ];
    }
}
