<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadNoteRequest;
use App\Http\Resources\LeadNoteResource;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LeadNoteController extends Controller
{
    public function store(StoreLeadNoteRequest $request, Lead $lead): JsonResponse
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        $nota = $lead->notas()->create([
            'usuario_id' => $usuario->id,
            'nota' => $request->validated('nota'),
        ]);
        $nota->load('usuario');

        return response()->json(LeadNoteResource::make($nota)->resolve($request), 201);
    }
}
