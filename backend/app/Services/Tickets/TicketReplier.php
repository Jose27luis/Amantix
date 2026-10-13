<?php

declare(strict_types=1);

namespace App\Services\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TicketReplier
{
    public function __construct(
        private readonly AttachmentStore $adjuntos,
        private readonly AuditRecorder $auditoria,
    ) {
    }

    public function responder(Ticket $ticket, User $usuario, string $texto, bool $interno, array $archivos): TicketMessage
    {
        if ($ticket->estado === TicketStatus::Cerrado) {
            throw ValidationException::withMessages(['mensaje' => 'El ticket está cerrado. Abre uno nuevo si necesitas más ayuda.']);
        }

        if (! $usuario->esAdministrador() && $ticket->estado === TicketStatus::Resuelto && ! $ticket->puedeReabrirse()) {
            throw ValidationException::withMessages(['mensaje' => 'Pasaron más de 7 días desde que se resolvió. Abre un ticket nuevo.']);
        }

        return DB::transaction(function () use ($ticket, $usuario, $texto, $interno, $archivos): TicketMessage {
            $esInterno = $usuario->esAdministrador() && $interno;

            $mensaje = $ticket->mensajes()->create([
                'usuario_id' => $usuario->id,
                'mensaje' => trim($texto),
                'interno' => $esInterno,
            ]);

            $this->adjuntos->guardar($mensaje, $archivos);

            if (! $esInterno) {
                $usuario->esAdministrador() ? $this->respuestaDelEquipo($ticket, $usuario) : $this->respuestaDelCliente($ticket, $usuario);
            }

            $ticket->touch();

            return $mensaje;
        });
    }

    private function respuestaDelEquipo(Ticket $ticket, User $usuario): void
    {
        $ticket->primera_respuesta ??= now();
        $ticket->pendiente_respuesta = false;
        $ticket->asignado_a ??= $usuario->id;

        if (in_array($ticket->estado, [TicketStatus::Abierto, TicketStatus::EnAtencion], true)) {
            $ticket->estado = TicketStatus::Esperando;
        }

        $ticket->save();
    }

    private function respuestaDelCliente(Ticket $ticket, User $usuario): void
    {
        $anterior = $ticket->estado;
        $ticket->pendiente_respuesta = true;

        if ($anterior === TicketStatus::Resuelto) {
            $ticket->estado = TicketStatus::Abierto;
            $ticket->resuelto_en = null;
            $this->auditoria->registrar($usuario, 'ticket_reabierto', $ticket);
        } elseif ($anterior === TicketStatus::Esperando) {
            $ticket->estado = TicketStatus::EnAtencion;
        }

        $ticket->save();
    }
}
