<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\PaymentMethod;
use App\Enums\PaymentReportStatus;
use App\Enums\ReceivableStatus;
use App\Models\BillingInvoice;
use App\Models\Company;
use App\Models\Integration;
use App\Models\PaymentAccount;
use App\Models\PaymentApplication;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class BillingService
{
    private const CENTIMO = 0.001;

    public function __construct(
        private readonly AuditRecorder $auditoria,
        private readonly PaymentCaptureStore $capturas,
        private readonly Pro8InvoiceEmitter $emisor,
    ) {
    }

    public function crearManual(Company $empresa, array $datos, User $autor): Receivable
    {
        $cuenta = $empresa->cuentasPorCobrar()->create([
            'concepto' => mb_strtoupper(trim((string) $datos['concepto'])),
            'monto' => $datos['monto'],
            'monto_pagado' => 0,
            'vence' => $datos['vence'],
            'estado' => ReceivableStatus::Pendiente,
            'origen' => Receivable::ORIGEN_MANUAL,
            'creado_por' => $autor->id,
        ]);

        $this->auditoria->registrar($autor, 'cuenta_cobrar_creada', $cuenta, ['monto' => (float) $cuenta->monto]);

        return $cuenta;
    }

    public function editar(Receivable $cuenta, array $datos, User $autor): Receivable
    {
        $cuenta = DB::transaction(function () use ($cuenta, $datos): Receivable {
            $bloqueada = Receivable::query()->lockForUpdate()->findOrFail($cuenta->id);

            if (! $bloqueada->estado->cobrable()) {
                throw ValidationException::withMessages(['cuenta' => 'Solo se editan cuentas que siguen por cobrar.']);
            }

            if (isset($datos['monto']) && (float) $datos['monto'] + self::CENTIMO < (float) $bloqueada->monto_pagado) {
                throw ValidationException::withMessages([
                    'monto' => 'El monto no puede ser menor a lo ya pagado (S/ '.number_format((float) $bloqueada->monto_pagado, 2).').',
                ]);
            }

            if (isset($datos['concepto'])) {
                $datos['concepto'] = mb_strtoupper(trim((string) $datos['concepto']));
            }

            $bloqueada->fill(array_intersect_key($datos, array_flip(['concepto', 'monto', 'vence'])));
            $this->actualizarEstado($bloqueada);
            $bloqueada->save();

            return $bloqueada;
        });

        $this->auditoria->registrar($autor, 'cuenta_cobrar_editada', $cuenta, ['campos' => array_keys($cuenta->getChanges())]);

        return $cuenta;
    }

    public function anular(Receivable $cuenta, string $motivo, User $autor): Receivable
    {
        $cuenta = DB::transaction(function () use ($cuenta, $motivo): Receivable {
            $bloqueada = Receivable::query()->lockForUpdate()->findOrFail($cuenta->id);

            if (! $bloqueada->estado->cobrable()) {
                throw ValidationException::withMessages(['motivo' => 'Solo se anulan cuentas que siguen por cobrar.']);
            }

            if ((float) $bloqueada->monto_pagado > 0) {
                throw ValidationException::withMessages(['motivo' => 'La cuenta ya tiene pagos aplicados y no se puede anular.']);
            }

            $bloqueada->fill(['estado' => ReceivableStatus::Anulada, 'motivo_anulacion' => $motivo])->save();

            return $bloqueada;
        });

        $this->auditoria->registrar($autor, 'cuenta_cobrar_anulada', $cuenta, ['motivo' => $motivo]);

        return $cuenta;
    }

    public function deuda(Company $empresa): float
    {
        return round((float) Receivable::query()
            ->where('empresa_id', $empresa->id)
            ->whereIn('estado', ReceivableStatus::cobrables())
            ->sum(DB::raw('monto - monto_pagado')), 2);
    }

    public function reportar(
        Company $empresa,
        array $datos,
        ?UploadedFile $captura,
        ?User $autor,
        string $origen,
        ?Integration $integracion = null,
        ?Receivable $preferida = null,
    ): PaymentReport {
        $clave = $this->texto($datos['clave_idempotencia'] ?? null);
        if ($clave !== null) {
            $previo = $this->porClave($clave, $empresa);
            if ($previo !== null) {
                return $previo;
            }
        }

        if ($preferida !== null && ($preferida->empresa_id !== $empresa->id || ! $preferida->estado->cobrable())) {
            throw ValidationException::withMessages(['cuenta' => 'Esta cuenta ya no admite pagos.']);
        }

        $deuda = $this->deuda($empresa);
        if ($deuda <= 0) {
            throw ValidationException::withMessages(['monto' => 'No hay deuda pendiente para registrar este pago.']);
        }

        $monto = round((float) ($datos['monto'] ?? ($preferida?->saldo() ?? $deuda)), 2);
        if ($monto <= 0) {
            throw ValidationException::withMessages(['monto' => 'El monto debe ser mayor a cero.']);
        }
        if ($monto - $deuda > self::CENTIMO) {
            throw ValidationException::withMessages(['monto' => 'El monto supera la deuda pendiente (S/ '.number_format($deuda, 2).').']);
        }

        $metodoPago = isset($datos['metodo_pago_id']) ? PaymentAccount::query()->findOrFail((int) $datos['metodo_pago_id']) : null;
        $metodo = $metodoPago?->tipo ?? PaymentMethod::from((string) $datos['metodo']);
        $numero = $this->texto($datos['numero_operacion'] ?? null);
        $archivo = $captura === null ? [] : $this->capturas->guardar($empresa->id, $captura);

        try {
            $pago = PaymentReport::query()->create([
                'clave_idempotencia' => $clave,
                'cuenta_id' => $preferida?->id,
                'empresa_id' => $empresa->id,
                'monto' => $monto,
                'monto_reportado' => $monto,
                'metodo' => $metodo,
                'metodo_pago_id' => $metodoPago?->id,
                'numero_operacion' => $numero,
                'operacion_activa' => $this->operacionActiva($metodoPago, $metodo, $numero),
                'fecha_pago' => $datos['fecha_pago'],
                'origen' => $origen,
                'reportado_por' => $autor?->id,
                'reportado_nombre' => $this->texto($datos['reportado_nombre'] ?? null) === null ? null : mb_substr((string) $datos['reportado_nombre'], 0, 120),
                'integracion_id' => $integracion?->id,
                'estado' => PaymentReportStatus::EnRevision,
                ...$archivo,
            ]);
        } catch (UniqueConstraintViolationException $error) {
            $this->borrarCaptura($archivo);

            if ($clave !== null && ($previo = $this->porClave($clave, $empresa)) !== null) {
                return $previo;
            }

            throw ValidationException::withMessages(['numero_operacion' => 'Ya se registró un pago con ese número de operación.']);
        }

        $this->auditoria->registrar($autor, 'pago_reportado', $pago, array_filter([
            'monto' => $monto,
            'origen' => $origen,
            'integracion' => $integracion?->nombre,
        ]));

        return $pago;
    }

    public function registrarCobro(Company $empresa, array $datos, ?UploadedFile $captura, User $administrador, ?Receivable $preferida = null): PaymentReport
    {
        $pago = $this->reportar($empresa, $datos, $captura, $administrador, PaymentReport::ORIGEN_ADMINISTRADOR, null, $preferida);

        return $pago->estado === PaymentReportStatus::EnRevision ? $this->aceptar($pago, $administrador) : $pago;
    }

    public function aceptar(PaymentReport $pago, User $administrador, array $ajustes = []): PaymentReport
    {
        try {
            $aceptado = DB::transaction(fn (): PaymentReport => $this->aplicar($pago->id, $administrador, $ajustes));
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['numero_operacion' => 'Ya se registró un pago con ese número de operación.']);
        }

        $this->auditoria->registrar($administrador, 'pago_aceptado', $aceptado, [
            'monto' => (float) $aceptado->monto,
            'cuentas' => $aceptado->aplicaciones->pluck('cuenta_id')->all(),
        ]);

        $this->emisor->emitir($aceptado);

        return $aceptado->refresh();
    }

    public function rechazar(PaymentReport $pago, string $motivo, User $administrador): PaymentReport
    {
        $tomado = PaymentReport::query()
            ->whereKey($pago->id)
            ->where('estado', PaymentReportStatus::EnRevision)
            ->update([
                'estado' => PaymentReportStatus::Rechazado->value,
                'operacion_activa' => null,
                'motivo_rechazo' => $motivo,
                'revisado_por' => $administrador->id,
                'revisado_at' => now(),
                'updated_at' => now(),
            ]);

        if ($tomado === 0) {
            throw new ConflictHttpException('Este pago ya fue revisado.');
        }

        $pago->refresh();
        $this->auditoria->registrar($administrador, 'pago_rechazado', $pago, ['motivo' => $motivo]);

        return $pago;
    }

    public function reemitir(PaymentReport $pago, User $administrador): BillingInvoice
    {
        if ($pago->estado !== PaymentReportStatus::Aceptado) {
            throw ValidationException::withMessages(['pago' => 'Solo se emite comprobante de pagos aceptados.']);
        }

        $comprobante = $this->emisor->emitir($pago);
        $this->auditoria->registrar($administrador, 'comprobante_emitido', $comprobante, ['estado' => $comprobante->estado]);

        return $comprobante;
    }

    private function aplicar(int $pagoId, User $administrador, array $ajustes): PaymentReport
    {
        $pago = PaymentReport::query()->with('metodoPago')->lockForUpdate()->findOrFail($pagoId);

        if ($pago->estado !== PaymentReportStatus::EnRevision) {
            throw new ConflictHttpException('Este pago ya fue revisado.');
        }

        $monto = round((float) ($ajustes['monto'] ?? $pago->monto), 2);
        $numero = array_key_exists('numero_operacion', $ajustes) ? $this->texto($ajustes['numero_operacion']) : $pago->numero_operacion;

        $cuentas = $this->cuentasEnOrden($pago);
        $deuda = round($cuentas->sum(fn (Receivable $cuenta): float => $cuenta->saldo()), 2);

        if ($monto <= 0) {
            throw ValidationException::withMessages(['monto' => 'El monto debe ser mayor a cero.']);
        }
        if ($monto - $deuda > self::CENTIMO) {
            throw ValidationException::withMessages([
                'monto' => 'El pago (S/ '.number_format($monto, 2).') supera la deuda actual (S/ '.number_format($deuda, 2).'). Corrige el monto antes de aceptar.',
            ]);
        }

        $restante = $monto;
        foreach ($cuentas as $cuenta) {
            if ($restante <= 0) {
                break;
            }

            $aplicado = round(min($cuenta->saldo(), $restante), 2);
            if ($aplicado <= 0) {
                continue;
            }

            PaymentApplication::query()->create(['pago_id' => $pago->id, 'cuenta_id' => $cuenta->id, 'monto' => $aplicado]);

            $cuenta->monto_pagado = round((float) $cuenta->monto_pagado + $aplicado, 2);
            $this->actualizarEstado($cuenta);
            $cuenta->save();

            $restante = round($restante - $aplicado, 2);
        }

        $pago->fill([
            'monto' => $monto,
            'numero_operacion' => $numero,
            'operacion_activa' => $this->operacionActiva($pago->metodoPago, $pago->metodo, $numero),
            'estado' => PaymentReportStatus::Aceptado,
            'revisado_por' => $administrador->id,
            'revisado_at' => now(),
        ])->save();

        return $pago->load('aplicaciones.cuenta');
    }

    private function cuentasEnOrden(PaymentReport $pago): Collection
    {
        $cuentas = Receivable::query()
            ->where('empresa_id', $pago->empresa_id)
            ->whereIn('estado', ReceivableStatus::cobrables())
            ->orderBy('vence')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        if ($pago->cuenta_id === null) {
            return $cuentas;
        }

        return $cuentas->sortBy(fn (Receivable $cuenta): int => $cuenta->id === $pago->cuenta_id ? 0 : 1)->values();
    }

    private function actualizarEstado(Receivable $cuenta): void
    {
        $pagado = (float) $cuenta->monto_pagado;

        if ($pagado + self::CENTIMO >= (float) $cuenta->monto) {
            $cuenta->estado = ReceivableStatus::Pagada;
            $cuenta->pagada_at ??= now();

            return;
        }

        $cuenta->estado = $pagado > 0 ? ReceivableStatus::Parcial : ReceivableStatus::Pendiente;
        $cuenta->pagada_at = null;
    }

    private function operacionActiva(?PaymentAccount $metodoPago, PaymentMethod $metodo, ?string $numero): ?string
    {
        if ($numero === null || $metodo === PaymentMethod::Efectivo) {
            return null;
        }

        $normalizado = mb_strtoupper(preg_replace('/[\s-]+/', '', $numero) ?? $numero);

        return mb_substr(($metodoPago !== null ? 'm'.$metodoPago->id : $metodo->value).':'.$normalizado, 0, 120);
    }

    private function porClave(string $clave, Company $empresa): ?PaymentReport
    {
        $previo = PaymentReport::query()->where('clave_idempotencia', $clave)->first();

        if ($previo !== null && $previo->empresa_id !== $empresa->id) {
            throw new ConflictHttpException('La clave de idempotencia ya se usó para otro cliente.');
        }

        return $previo;
    }

    private function borrarCaptura(array $archivo): void
    {
        if (isset($archivo['captura_ruta'])) {
            Storage::disk(PaymentCaptureStore::DISCO)->delete($archivo['captura_ruta']);
        }
    }

    private function texto(mixed $valor): ?string
    {
        if (! is_string($valor)) {
            return null;
        }

        $limpio = trim($valor);

        return $limpio === '' ? null : $limpio;
    }
}
