<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('amantix:close-resolved-tickets')->hourly();
Schedule::command('amantix:generate-receivables')->dailyAt('06:00');
