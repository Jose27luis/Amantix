<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConvertLeadRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Lead;
use App\Models\User;
use App\Services\Leads\LeadConverter;
use Illuminate\Http\JsonResponse;

class LeadConversionController extends Controller
{
    public function store(ConvertLeadRequest $request, Lead $lead, LeadConverter $conversor): JsonResponse
    {
        $autor = $request->user();
        abort_unless($autor instanceof User, 401);

        $resultado = $conversor->convertir($lead, $request->validated(), $autor);

        return response()->json([
            'empresa' => CompanyResource::make($resultado['empresa'])->resolve($request),
            'correo' => $resultado['usuario']->correo,
            'password_temporal' => $resultado['password_temporal'],
        ], 201);
    }
}
