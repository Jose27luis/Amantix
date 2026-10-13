<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Http\Resources\TicketMessageResource;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Tickets\TicketReplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class TicketMessageController extends Controller
{
    public function store(StoreTicketMessageRequest $request, Ticket $ticket, TicketReplier $respuestas): JsonResponse
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);
        Gate::authorize('reply', $ticket);

        $mensaje = $respuestas->responder(
            $ticket,
            $usuario,
            (string) $request->validated('mensaje'),
            $request->boolean('interno'),
            $request->file('adjuntos', []),
        );
        $mensaje->load(['usuario', 'adjuntos']);

        return response()->json(TicketMessageResource::make($mensaje)->resolve($request), 201);
    }
}
