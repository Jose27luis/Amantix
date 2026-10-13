<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Attachment;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function view(User $usuario, Ticket $ticket): bool
    {
        return $usuario->esAdministrador() || ($usuario->empresa_id !== null && $usuario->empresa_id === $ticket->empresa_id);
    }

    public function reply(User $usuario, Ticket $ticket): bool
    {
        return $this->view($usuario, $ticket);
    }

    public function close(User $usuario, Ticket $ticket): bool
    {
        return $this->view($usuario, $ticket);
    }

    public function update(User $usuario, Ticket $ticket): bool
    {
        return $usuario->esAdministrador();
    }

    public function download(User $usuario, Ticket $ticket, Attachment $adjunto): bool
    {
        $mensaje = $adjunto->mensaje;

        if ($mensaje === null || $mensaje->ticket_id !== $ticket->id) {
            return false;
        }

        return $usuario->esAdministrador() || (! $mensaje->interno && $this->view($usuario, $ticket));
    }
}
