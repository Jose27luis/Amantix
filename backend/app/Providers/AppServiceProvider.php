<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        RateLimiter::for('leads', static fn (Request $request): array => [
            Limit::perMinute(3)->by((string) $request->ip()),
            Limit::perDay(20)->by((string) $request->ip()),
        ]);

        RateLimiter::for('login', static fn (Request $request): Limit => Limit::perMinute(10)->by((string) $request->ip()));
    }
}
