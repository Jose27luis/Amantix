<?php

declare(strict_types=1);

namespace App\Services\Leads;

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Facades\DB;

class LeadUpdater
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function actualizar(Lead $lead, array $datos, User $usuario): Lead
    {
        return DB::transaction(function () use ($lead, $datos, $usuario): Lead {
            if (array_key_exists('estado', $datos)) {
                $this->cambiarEstado($lead, LeadStatus::from($datos['estado']), $datos['motivo_perdida'] ?? null, $usuario);
            }

            if (array_key_exists('asignado_a', $datos)) {
                $this->asignar($lead, $datos['asignado_a'] === null ? null : (int) $datos['asignado_a'], $usuario);
            }

            $lead->save();

            return $lead->refresh();
        });
    }

    private function cambiarEstado(Lead $lead, LeadStatus $nuevo, ?string $motivo, User $usuario): void
    {
        $anterior = $lead->estado;

        if ($anterior === $nuevo) {
            return;
        }

        $lead->estado = $nuevo;
        $lead->motivo_perdida = $nuevo === LeadStatus::Perdido ? $motivo : null;

        $this->auditoria->registrar($usuario, 'lead_estado', $lead, array_filter([
            'de' => $anterior->value,
            'a' => $nuevo->value,
            'motivo' => $lead->motivo_perdida,
        ], static fn (?string $valor): bool => $valor !== null));
    }

    private function asignar(Lead $lead, ?int $usuarioId, User $usuario): void
    {
        if ($lead->asignado_a === $usuarioId) {
            return;
        }

        $lead->asignado_a = $usuarioId;

        $this->auditoria->registrar($usuario, 'lead_asignado', $lead, ['usuario_id' => $usuarioId]);
    }
}
