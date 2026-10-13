<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\SubscriptionResource;
use App\Http\Resources\TicketResource;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientSummaryController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        $empresa = Company::query()->find($usuario->empresa_id);
        abort_if($empresa === null, 403, 'Tu usuario no pertenece a una empresa cliente.');

        $suscripciones = $empresa->suscripciones()->with(['producto', 'plan'])->orderBy('proxima_renovacion')->get();
        $tickets = $empresa->tickets()->with(['empresa', 'producto', 'asignado'])->latest('updated_at')->limit(5)->get();

        return response()->json([
            'empresa' => CompanyResource::make($empresa)->resolve($request),
            'suscripciones' => SubscriptionResource::collection($suscripciones)->resolve($request),
            'tickets_abiertos' => $empresa->tickets()->whereIn('estado', TicketStatus::activos())->count(),
            'tickets_recientes' => TicketResource::collection($tickets)->resolve($request),
        ]);
    }
}
