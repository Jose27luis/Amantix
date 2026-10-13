<?php

declare(strict_types=1);

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditRecorder
{
    public function registrar(?User $usuario, string $accion, Model $entidad, array $detalle = []): AuditLog
    {
        return AuditLog::query()->create([
            'usuario_id' => $usuario?->id,
            'accion' => $accion,
            'entidad' => $entidad->getTable(),
            'entidad_id' => (int) $entidad->getKey(),
            'detalle' => $detalle === [] ? null : $detalle,
        ]);
    }
}
