<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicLeadRequest;
use App\Services\Leads\LeadRegistrar;
use Illuminate\Http\JsonResponse;

class PublicLeadController extends Controller
{
    public function store(StorePublicLeadRequest $request, LeadRegistrar $registrador): JsonResponse
    {
        $lead = $registrador->registrar($request->safe()->except('sitio_web'), $request->ip());
        $lead->load('producto');

        return response()->json([
            'codigo' => $lead->codigo,
            'producto' => $lead->producto?->nombre,
            'origen' => $lead->origen->value,
        ], 201);
    }
}
