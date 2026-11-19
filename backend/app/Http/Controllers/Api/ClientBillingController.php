<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\ReceivableStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReportPaymentRequest;
use App\Http\Resources\ReceivableResource;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\User;
use App\Services\Billing\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientBillingController extends Controller
{
    private const RELACIONES = ['suscripcion.producto', 'pagos', 'comprobante'];

    public function index(Request $request): JsonResponse
    {
        $usuario = $this->usuario($request);

        $porPagar = Receivable::query()
            ->with(self::RELACIONES)
            ->where('empresa_id', $usuario->empresa_id)
            ->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision])
            ->orderBy('vence')
            ->get();

        $pagadas = Receivable::query()
            ->with(self::RELACIONES)
            ->where('empresa_id', $usuario->empresa_id)
            ->where('estado', ReceivableStatus::Pagada)
            ->orderByDesc('pagada_at')
            ->limit(24)
            ->get();

        return response()->json([
            'por_pagar' => ReceivableResource::collection($porPagar)->resolve($request),
            'pagadas' => ReceivableResource::collection($pagadas)->resolve($request),
        ]);
    }

    public function reportar(ReportPaymentRequest $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $usuario = $this->usuario($request);
        abort_unless($receivable->empresa_id === $usuario->empresa_id, 404);

        $servicio->reportar($receivable, $request->validated(), $request->file('captura'), $usuario, PaymentReport::ORIGEN_PORTAL);

        return response()->json(ReceivableResource::make($receivable->refresh()->load(self::RELACIONES))->resolve($request), 201);
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);
        abort_if($usuario->empresa_id === null, 403, 'Tu usuario no pertenece a una empresa cliente.');

        return $usuario;
    }
}
