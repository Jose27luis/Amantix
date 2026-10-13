<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Tickets\TicketStatusChanger;
use Illuminate\Console\Command;

class CloseResolvedTicketsCommand extends Command
{
    protected $signature = 'amantix:close-resolved-tickets';

    protected $description = 'Cierra los tickets resueltos hace más de 7 días sin respuesta del cliente';

    public function handle(TicketStatusChanger $servicio): int
    {
        $cerrados = $servicio->cerrarResueltosVencidos();
        $this->info("Tickets cerrados: {$cerrados}");

        return self::SUCCESS;
    }
}
