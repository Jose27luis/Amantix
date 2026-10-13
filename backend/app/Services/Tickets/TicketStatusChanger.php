<?php

declare(strict_types=1);

namespace App\Services\Tickets;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TicketStatusChanger
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function actualizar(Ticket $ticket, array $datos, User $autor): Ticket
    {
        return DB::transaction(function () use ($ticket, $datos, $autor): Ticket {
            if (array_key_exists('estado', $datos)) {
                $this->cambiarEstado($ticket, TicketStatus::from($datos['estado']), $autor);
            }

            if (array_key_exists('prioridad', $datos)) {
                $ticket->prioridad = TicketPriority::from($datos['prioridad']);
            }

            if (array_key_exists('asignado_a', $datos)) {
                $nuevo = $datos['asignado_a'] === null ? null : (int) $datos['asignado_a'];
                if ($ticket->asignado_a !== $nuevo) {
                    $ticket->asignado_a = $nuevo;
                    $this->auditoria->registrar($autor, 'ticket_asignado', $ticket, ['usuario_id' => $nuevo]);
                }
            }

            $ticket->save();

            return $ticket;
        });
    }

    public function cerrar(Ticket $ticket, User $usuario): Ticket
    {
        if ($ticket->estado === TicketStatus::Cerrado) {
            throw ValidationException::withMessages(['estado' => 'El ticket ya está cerrado.']);
        }

        $this->cambiarEstado($ticket, TicketStatus::Cerrado, $usuario);
        $ticket->save();

        return $ticket;
    }

    private function cambiarEstado(Ticket $ticket, TicketStatus $nuevo, ?User $autor): void
    {
        $anterior = $ticket->estado;

        if ($anterior === $nuevo) {
            return;
        }

        $ticket->estado = $nuevo;

        if ($nuevo === TicketStatus::Resuelto) {
            $ticket->resuelto_en = now();
            $ticket->pendiente_respuesta = false;
        }

        if ($nuevo === TicketStatus::Cerrado) {
            $ticket->cerrado_en = now();
            $ticket->pendiente_respuesta = false;
        }

        if (in_array($nuevo, TicketStatus::activos(), true)) {
            $ticket->resuelto_en = null;
            $ticket->cerrado_en = null;
        }

        $this->auditoria->registrar($autor, 'ticket_estado', $ticket, ['de' => $anterior->value, 'a' => $nuevo->value]);
    }

    public function cerrarResueltosVencidos(): int
    {
        $vencidos = Ticket::query()
            ->where('estado', TicketStatus::Resuelto)
            ->where('resuelto_en', '<', now()->subDays(Ticket::DIAS_PARA_REABRIR))
            ->get();

        foreach ($vencidos as $ticket) {
            $this->cambiarEstado($ticket, TicketStatus::Cerrado, null);
            $ticket->save();
        }

        return $vencidos->count();
    }
}
