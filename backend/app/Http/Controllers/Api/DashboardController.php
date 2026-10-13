<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DashboardRequest;
use App\Services\Dashboard\LeadMetrics;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(DashboardRequest $request, LeadMetrics $metricas): JsonResponse
    {
        $hoy = CarbonImmutable::now();
        $desde = $request->filled('desde')
            ? CarbonImmutable::parse((string) $request->validated('desde'))->startOfDay()
            : $hoy->startOfMonth();
        $hasta = $request->filled('hasta')
            ? CarbonImmutable::parse((string) $request->validated('hasta'))->endOfDay()
            : $hoy->endOfDay();
        $productoId = $request->filled('producto_id') ? (int) $request->validated('producto_id') : null;

        return response()->json([
            'leads' => $metricas->calcular($desde, $hasta, $productoId),
        ]);
    }
}
