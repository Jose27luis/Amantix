<?php

declare(strict_types=1);

namespace App\Services\Tickets;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TicketOpener
{
    public function __construct(
        private readonly AttachmentStore $adjuntos,
        private readonly AuditRecorder $auditoria,
    ) {
    }

    public function abrir(User $cliente, array $datos, array $archivos): Ticket
    {
        return DB::transaction(function () use ($cliente, $datos, $archivos): Ticket {
            $ticket = Ticket::query()->create([
                'codigo' => $this->generarCodigo(),
                'empresa_id' => (int) $cliente->empresa_id,
                'producto_id' => isset($datos['producto_id']) ? (int) $datos['producto_id'] : null,
                'creado_por' => $cliente->id,
                'asunto' => trim($datos['asunto']),
                'prioridad' => TicketPriority::from($datos['prioridad']),
                'estado' => TicketStatus::Abierto,
                'pendiente_respuesta' => true,
            ]);

            $mensaje = $ticket->mensajes()->create([
                'usuario_id' => $cliente->id,
                'mensaje' => trim($datos['mensaje']),
                'interno' => false,
            ]);

            $this->adjuntos->guardar($mensaje, $archivos);
            $this->auditoria->registrar($cliente, 'ticket_abierto', $ticket);

            return $ticket;
        });
    }

    private function generarCodigo(): string
    {
        do {
            $codigo = 'TKT-'.Str::upper(Str::random(6));
        } while (Ticket::query()->where('codigo', $codigo)->exists());

        return $codigo;
    }
}
