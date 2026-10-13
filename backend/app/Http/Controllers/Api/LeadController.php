<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeadIndexRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\LeadNoteResource;
use App\Http\Resources\LeadResource;
use App\Models\AuditLog;
use App\Models\Lead;
use App\Models\User;
use App\Services\Leads\LeadSearch;
use App\Services\Leads\LeadUpdater;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LeadController extends Controller
{
    public function index(LeadIndexRequest $request, LeadSearch $busqueda): AnonymousResourceCollection
    {
        return LeadResource::collection($busqueda->buscar($request->validated()));
    }

    public function pendientes(): JsonResponse
    {
        return response()->json([
            'nuevos' => Lead::query()->where('estado', LeadStatus::Nuevo)->count(),
        ]);
    }

    public function show(Request $request, Lead $lead): JsonResponse
    {
        $lead->load(['producto', 'asignado', 'notas.usuario']);

        $historial = AuditLog::query()
            ->with('usuario')
            ->where('entidad', $lead->getTable())
            ->where('entidad_id', $lead->id)
            ->latest('created_at')
            ->get();

        return response()->json([
            'lead' => LeadResource::make($lead)->resolve($request),
            'notas' => LeadNoteResource::collection($lead->notas)->resolve($request),
            'historial' => AuditLogResource::collection($historial)->resolve($request),
        ]);
    }

    public function update(UpdateLeadRequest $request, Lead $lead, LeadUpdater $actualizador): JsonResponse
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        $lead = $actualizador->actualizar($lead, $request->validated(), $usuario);
        $lead->load(['producto', 'asignado']);

        return response()->json(LeadResource::make($lead)->resolve($request));
    }
}
