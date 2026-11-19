<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Billing\ReceivableGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class GenerateReceivablesCommand extends Command
{
    protected $signature = 'amantix:generate-receivables';

    protected $description = 'Genera las cuentas por cobrar de las suscripciones que vencen en los próximos días';

    public function handle(ReceivableGenerator $generador): int
    {
        $creadas = $generador->generarPendientes(CarbonImmutable::today());
        $this->info("Cuentas por cobrar generadas: {$creadas}");

        return self::SUCCESS;
    }
}
