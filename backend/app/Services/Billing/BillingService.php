<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\PaymentMethod;
use App\Enums\PaymentReportStatus;
use App\Enums\ReceivableStatus;
use App\Models\BillingInvoice;
use App\Models\Company;
use App\Models\PaymentAccount;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillingService
{
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
        if (! $cuenta->estado->cobrable()) {
            throw ValidationException::withMessages(['cuenta' => 'Solo se editan cuentas pendientes o en revisión.']);
        }

        if (isset($datos['concepto'])) {
            $datos['concepto'] = mb_strtoupper(trim((string) $datos['concepto']));
        }

        $cuenta->fill(array_intersect_key($datos, array_flip(['concepto', 'monto', 'vence'])));
        $cambios = array_keys($cuenta->getDirty());
        $cuenta->save();

        if ($cambios !== []) {
            $this->auditoria->registrar($autor, 'cuenta_cobrar_editada', $cuenta, ['campos' => $cambios]);
        }

        return $cuenta;
    }

    public function anular(Receivable $cuenta, string $motivo, User $autor): Receivable
    {
        if (! $cuenta->estado->cobrable()) {
            throw ValidationException::withMessages(['motivo' => 'Solo se anulan cuentas pendientes o en revisión.']);
        }

        DB::transaction(function () use ($cuenta, $motivo): void {
            $cuenta->pagos()->where('estado', PaymentReportStatus::EnRevision)->update([
                'estado' => PaymentReportStatus::Rechazado,
                'motivo_rechazo' => 'Cuenta anulada',
            ]);
            $cuenta->fill(['estado' => ReceivableStatus::Anulada, 'motivo_anulacion' => $motivo])->save();
        });

        $this->auditoria->registrar($autor, 'cuenta_cobrar_anulada', $cuenta, ['motivo' => $motivo]);

        return $cuenta;
    }

    public function reportar(Receivable $cuenta, array $datos, ?UploadedFile $captura, User $autor, string $origen): PaymentReport
    {
        if (! $cuenta->estado->cobrable()) {
            throw ValidationException::withMessages(['cuenta' => 'Esta cuenta ya no admite pagos.']);
        }

        $pago = DB::transaction(function () use ($cuenta, $datos, $captura, $autor, $origen): PaymentReport {
            $archivo = $captura === null ? [] : $this->capturas->guardar($cuenta->empresa_id, $captura);
            $metodoPago = isset($datos['metodo_pago_id']) ? PaymentAccount::query()->findOrFail((int) $datos['metodo_pago_id']) : null;

            $pago = $cuenta->pagos()->create([
                'empresa_id' => $cuenta->empresa_id,
                'monto' => $datos['monto'] ?? $cuenta->monto,
                'metodo' => $metodoPago?->tipo ?? PaymentMethod::from((string) $datos['metodo']),
                'metodo_pago_id' => $metodoPago?->id,
                'numero_operacion' => $datos['numero_operacion'] ?? null,
                'fecha_pago' => $datos['fecha_pago'],
                'origen' => $origen,
                'reportado_por' => $autor->id,
                'estado' => PaymentReportStatus::EnRevision,
                ...$archivo,
            ]);

            $cuenta->fill(['estado' => ReceivableStatus::EnRevision])->save();

            return $pago;
        });

        $this->auditoria->registrar($autor, 'pago_reportado', $pago, ['cuenta_id' => $cuenta->id, 'origen' => $origen]);

        return $pago;
    }

    public function registrarCobro(Receivable $cuenta, array $datos, ?UploadedFile $captura, User $administrador): PaymentReport
    {
        $pago = $this->reportar($cuenta, $datos, $captura, $administrador, PaymentReport::ORIGEN_ADMINISTRADOR);

        return $this->aceptar($pago, $administrador);
    }

    public function aceptar(PaymentReport $pago, User $administrador): PaymentReport
    {
        if ($pago->estado !== PaymentReportStatus::EnRevision) {
            throw ValidationException::withMessages(['pago' => 'Este pago ya fue revisado.']);
        }

        $cuenta = DB::transaction(function () use ($pago, $administrador): Receivable {
            $pago->fill([
                'estado' => PaymentReportStatus::Aceptado,
                'revisado_por' => $administrador->id,
                'revisado_at' => now(),
            ])->save();

            $cuenta = Receivable::query()->lockForUpdate()->findOrFail($pago->cuenta_id);
            $cuenta->pagos()
                ->where('estado', PaymentReportStatus::EnRevision)
                ->whereKeyNot($pago->id)
                ->update(['estado' => PaymentReportStatus::Rechazado, 'motivo_rechazo' => 'Se aceptó otro pago para esta cuenta']);
            $cuenta->fill(['estado' => ReceivableStatus::Pagada, 'pagada_at' => now()])->save();

            return $cuenta;
        });

        $this->auditoria->registrar($administrador, 'pago_aceptado', $pago, ['cuenta_id' => $cuenta->id]);
        $this->emisor->emitir($cuenta);

        return $pago->refresh();
    }

    public function rechazar(PaymentReport $pago, string $motivo, User $administrador): PaymentReport
    {
        if ($pago->estado !== PaymentReportStatus::EnRevision) {
            throw ValidationException::withMessages(['pago' => 'Este pago ya fue revisado.']);
        }

        DB::transaction(function () use ($pago, $motivo, $administrador): void {
            $pago->fill([
                'estado' => PaymentReportStatus::Rechazado,
                'motivo_rechazo' => $motivo,
                'revisado_por' => $administrador->id,
                'revisado_at' => now(),
            ])->save();

            $cuenta = Receivable::query()->lockForUpdate()->findOrFail($pago->cuenta_id);
            $quedanEnRevision = $cuenta->pagos()->where('estado', PaymentReportStatus::EnRevision)->exists();
            if (! $quedanEnRevision && $cuenta->estado === ReceivableStatus::EnRevision) {
                $cuenta->fill(['estado' => ReceivableStatus::Pendiente])->save();
            }
        });

        $this->auditoria->registrar($administrador, 'pago_rechazado', $pago, ['motivo' => $motivo]);

        return $pago;
    }

    public function reemitir(Receivable $cuenta, User $administrador): BillingInvoice
    {
        if ($cuenta->estado !== ReceivableStatus::Pagada) {
            throw ValidationException::withMessages(['cuenta' => 'Solo se emite comprobante de cuentas pagadas.']);
        }

        $comprobante = $this->emisor->emitir($cuenta);
        $this->auditoria->registrar($administrador, 'comprobante_emitido', $comprobante, ['estado' => $comprobante->estado]);

        return $comprobante;
    }
}
