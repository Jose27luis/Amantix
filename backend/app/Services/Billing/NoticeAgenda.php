<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Enums\ReceivableStatus;
use App\Models\BillingNotice;
use App\Models\Receivable;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class NoticeAgenda
{
    public function __construct(private readonly BillingSettings $ajustes)
    {
    }

    public function deHoy(CarbonImmutable $hoy): array
    {
        $dias = $this->ajustes->recordatorios();
        if ($dias === []) {
            return [];
        }

        $cuentas = Receivable::query()
            ->with(['empresa', 'suscripcion'])
            ->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision])
            ->whereDate('vence', '<=', $hoy->subDays(min($dias))->toDateString())
            ->where(fn (Builder $q): Builder => $q->whereNull('suscripcion_id')->orWhereHas('suscripcion', fn (Builder $s): Builder => $s->where('avisar', true)))
            ->orderBy('vence')
            ->get();

        $enviados = BillingNotice::query()
            ->whereIn('cuenta_id', $cuentas->pluck('id'))
            ->get()
            ->groupBy('cuenta_id');

        $avisos = [];
        foreach ($cuentas as $cuenta) {
            $diferencia = (int) CarbonImmutable::parse($cuenta->vence)->diffInDays($hoy, false);
            $aplicables = array_values(array_filter($dias, static fn (int $dia): bool => $dia <= $diferencia));
            if ($aplicables === []) {
                continue;
            }

            $dia = max($aplicables);
            $previos = $enviados->get($cuenta->id);
            if ($previos !== null && $previos->contains(fn (BillingNotice $aviso): bool => $aviso->dia_relativo >= $dia)) {
                continue;
            }

            $avisos[] = [
                'cuenta' => $cuenta,
                'dia_relativo' => $dia,
                'dias_para_vencer' => -$diferencia,
                'mensaje' => $this->mensaje($cuenta),
                'whatsapp' => $this->whatsapp($cuenta->empresa?->telefono, $this->mensaje($cuenta)),
                'ultimo_aviso' => $previos?->max('created_at')?->toIso8601String(),
            ];
        }

        return $avisos;
    }

    public function registrar(Receivable $cuenta, int $dia, User $usuario): BillingNotice
    {
        if (! $cuenta->estado->cobrable()) {
            throw ValidationException::withMessages(['cuenta' => 'La cuenta ya no está por cobrar.']);
        }

        return BillingNotice::query()->create([
            'cuenta_id' => $cuenta->id,
            'canal' => BillingNotice::CANAL_WHATSAPP,
            'dia_relativo' => $dia,
            'enviado_por' => $usuario->id,
        ]);
    }

    public function mensaje(Receivable $cuenta): string
    {
        return $this->ajustes->mensaje([
            'cliente' => $cuenta->empresa?->razon_social ?? '',
            'concepto' => $cuenta->concepto,
            'monto' => 'S/ '.number_format((float) $cuenta->monto, 2),
            'vence' => CarbonImmutable::parse($cuenta->vence)->format('d/m/Y'),
            'enlace' => rtrim((string) config('app.url'), '/').'/panel/billing',
        ]);
    }

    private function whatsapp(?string $telefono, string $mensaje): ?string
    {
        $digitos = preg_replace('/\D/', '', (string) $telefono) ?? '';
        if (strlen($digitos) === 9 && str_starts_with($digitos, '9')) {
            $digitos = '51'.$digitos;
        }

        return strlen($digitos) >= 10 ? 'https://wa.me/'.$digitos.'?text='.rawurlencode($mensaje) : null;
    }
}
