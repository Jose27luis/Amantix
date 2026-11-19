<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\ReceivableStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReportPaymentRequest;
use App\Http\Resources\PaymentAccountResource;
use App\Http\Resources\PaymentReportResource;
use App\Http\Resources\ReceivableResource;
use App\Models\Company;
use App\Models\PaymentAccount;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\User;
use App\Services\Billing\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientBillingController extends Controller
{
    public function index(Request $request, BillingService $servicio): JsonResponse
    {
        $empresa = $this->empresa($request);

        $porPagar = Receivable::query()
            ->with(['suscripcion.producto', 'aplicaciones'])
            ->where('empresa_id', $empresa->id)
            ->whereIn('estado', ReceivableStatus::cobrables())
            ->orderBy('vence')
            ->get();

        $pagos = PaymentReport::query()
            ->with(['metodoPago', 'aplicaciones.cuenta', 'comprobante'])
            ->where('empresa_id', $empresa->id)
            ->latest()
            ->limit(24)
            ->get();

        return response()->json([
            'deuda' => $servicio->deuda($empresa),
            'por_pagar' => ReceivableResource::collection($porPagar)->resolve($request),
            'pagos' => PaymentReportResource::collection($pagos)->resolve($request),
            'metodos_pago' => PaymentAccountResource::collection(
                PaymentAccount::query()->where('activo', true)->orderBy('orden')->orderBy('id')->get()
            )->resolve($request),
        ]);
    }

    public function reportar(ReportPaymentRequest $request, BillingService $servicio): JsonResponse
    {
        $usuario = $this->usuario($request);
        $empresa = $this->empresa($request);
        $datos = $request->validated();

        $preferida = null;
        if (isset($datos['cuenta_id'])) {
            $preferida = Receivable::query()->where('empresa_id', $empresa->id)->find((int) $datos['cuenta_id']);
            abort_if($preferida === null, 404, 'Cuenta no encontrada.');
        }

        $pago = $servicio->reportar($empresa, $datos, $request->file('captura'), $usuario, PaymentReport::ORIGEN_PORTAL, null, $preferida);

        return response()->json(PaymentReportResource::make($pago->load(['metodoPago', 'aplicaciones.cuenta', 'comprobante']))->resolve($request), 201);
    }

    private function empresa(Request $request): Company
    {
        $empresa = Company::query()->find($this->usuario($request)->empresa_id);
        abort_if($empresa === null, 403, 'Tu usuario no pertenece a una empresa cliente.');

        return $empresa;
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
