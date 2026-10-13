<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyIndexRequest;
use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\SubscriptionResource;
use App\Http\Resources\TicketResource;
use App\Http\Resources\UserResource;
use App\Models\Company;
use App\Models\User;
use App\Services\Companies\CompanySearch;
use App\Services\Companies\CompanyService;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CompanyController extends Controller
{
    public function index(CompanyIndexRequest $request, CompanySearch $busqueda): AnonymousResourceCollection
    {
        return CompanyResource::collection($busqueda->buscar($request->validated()));
    }

    public function store(StoreCompanyRequest $request, CompanyService $servicio): JsonResponse
    {
        $empresa = $servicio->crear($request->validated(), $this->autor($request));

        return response()->json(CompanyResource::make($empresa)->resolve($request), 201);
    }

    public function show(Request $request, Company $company): JsonResponse
    {
        $company->load([
            'suscripciones' => fn (HasMany $consulta): HasMany => $consulta->with(['producto', 'plan'])->orderByRaw("estado = 'activa' desc")->orderBy('proxima_renovacion'),
            'usuarios' => fn (HasMany $consulta): HasMany => $consulta->with('empresa')->orderBy('nombre'),
        ]);

        $tickets = $company->tickets()->with(['empresa', 'producto', 'asignado'])->latest('updated_at')->limit(10)->get();

        return response()->json([
            'empresa' => CompanyResource::make($company)->resolve($request),
            'suscripciones' => SubscriptionResource::collection($company->suscripciones)->resolve($request),
            'usuarios' => UserResource::collection($company->usuarios)->resolve($request),
            'tickets' => TicketResource::collection($tickets)->resolve($request),
        ]);
    }

    public function update(UpdateCompanyRequest $request, Company $company, CompanyService $servicio): JsonResponse
    {
        $empresa = $servicio->actualizar($company, $request->validated(), $this->autor($request));

        return response()->json(CompanyResource::make($empresa)->resolve($request));
    }

    private function autor(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
