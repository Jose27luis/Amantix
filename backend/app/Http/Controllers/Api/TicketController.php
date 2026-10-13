<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\TicketIndexRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\TicketMessageResource;
use App\Http\Resources\TicketResource;
use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Tickets\TicketOpener;
use App\Services\Tickets\TicketSearch;
use App\Services\Tickets\TicketStatusChanger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class TicketController extends Controller
{
    public function index(TicketIndexRequest $request, TicketSearch $busqueda): AnonymousResourceCollection
    {
        $filtros = $request->validated();
        $filtros['sin_responder'] = $request->boolean('sin_responder');

        return TicketResource::collection($busqueda->buscar($filtros, $this->usuario($request)));
    }

    public function pendientes(): JsonResponse
    {
        return response()->json([
            'sin_responder' => Ticket::query()
                ->whereIn('estado', TicketStatus::activos())
                ->where('pendiente_respuesta', true)
                ->count(),
        ]);
    }

    public function store(StoreTicketRequest $request, TicketOpener $apertura): JsonResponse
    {
        $usuario = $this->usuario($request);
        abort_if($usuario->empresa_id === null, 403, 'Tu usuario no pertenece a una empresa cliente.');

        $ticket = $apertura->abrir($usuario, $request->validated(), $request->file('adjuntos', []));
        $ticket->load(['empresa', 'producto', 'asignado']);

        return response()->json(TicketResource::make($ticket)->resolve($request), 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $usuario = $this->usuario($request);
        Gate::authorize('view', $ticket);

        $ticket->load(['empresa', 'producto', 'asignado']);

        $mensajes = $ticket->mensajes()
            ->with(['usuario', 'adjuntos'])
            ->when(! $usuario->esAdministrador(), fn (Builder $consulta): Builder => $consulta->where('interno', false))
            ->orderBy('created_at')
            ->get();

        $historial = $usuario->esAdministrador()
            ? AuditLog::query()->with('usuario')->where('entidad', $ticket->getTable())->where('entidad_id', $ticket->id)->latest('created_at')->get()
            : collect();

        return response()->json([
            'ticket' => TicketResource::make($ticket)->resolve($request),
            'mensajes' => TicketMessageResource::collection($mensajes)->resolve($request),
            'historial' => AuditLogResource::collection($historial)->resolve($request),
        ]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket, TicketStatusChanger $cambios): JsonResponse
    {
        Gate::authorize('update', $ticket);

        $ticket = $cambios->actualizar($ticket, $request->validated(), $this->usuario($request));
        $ticket->load(['empresa', 'producto', 'asignado']);

        return response()->json(TicketResource::make($ticket)->resolve($request));
    }

    public function cerrar(Request $request, Ticket $ticket, TicketStatusChanger $cambios): JsonResponse
    {
        Gate::authorize('close', $ticket);

        $ticket = $cambios->cerrar($ticket, $this->usuario($request));
        $ticket->load(['empresa', 'producto', 'asignado']);

        return response()->json(TicketResource::make($ticket)->resolve($request));
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
