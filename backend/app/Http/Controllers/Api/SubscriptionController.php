<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubscriptionRequest;
use App\Http\Requests\UpdateSubscriptionRequest;
use App\Http\Resources\SubscriptionResource;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Subscriptions\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function store(StoreSubscriptionRequest $request, Company $company, SubscriptionService $servicio): JsonResponse
    {
        $suscripcion = $servicio->crear($company, $request->validated(), $this->autor($request));
        $suscripcion->load(['producto', 'plan']);

        return response()->json(SubscriptionResource::make($suscripcion)->resolve($request), 201);
    }

    public function update(UpdateSubscriptionRequest $request, Subscription $subscription, SubscriptionService $servicio): JsonResponse
    {
        $suscripcion = $servicio->actualizar($subscription, $request->validated(), $this->autor($request));
        $suscripcion->load(['producto', 'plan']);

        return response()->json(SubscriptionResource::make($suscripcion)->resolve($request));
    }

    private function autor(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
