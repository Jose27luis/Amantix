<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthenticateIntegration;
use App\Http\Requests\ReportPaymentRequest;
use App\Models\Integration;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Services\Billing\BillingService;
use App\Services\Billing\IntegrationStatement;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationBillingController extends Controller
{
    public function show(Request $request, string $cuenta, IntegrationStatement $estado): JsonResponse
    {
        $suscripcion = $estado->suscripcion($this->integracion($request), $cuenta);

        return response()->json($estado->estado($suscripcion, CarbonImmutable::today()));
    }

    public function reportarCuenta(
        ReportPaymentRequest $request,
        string $cuenta,
        Receivable $receivable,
        IntegrationStatement $estado,
        BillingService $servicio,
    ): JsonResponse {
        return $this->reportar($request, $cuenta, $receivable, $estado, $servicio);
    }

    public function reportarPago(
        ReportPaymentRequest $request,
        string $cuenta,
        IntegrationStatement $estado,
        BillingService $servicio,
    ): JsonResponse {
        $preferida = $request->validated('cuenta_id') !== null
            ? Receivable::query()->find((int) $request->validated('cuenta_id'))
            : null;

        return $this->reportar($request, $cuenta, $preferida, $estado, $servicio);
    }

    private function reportar(
        ReportPaymentRequest $request,
        string $cuenta,
        ?Receivable $preferida,
        IntegrationStatement $estado,
        BillingService $servicio,
    ): JsonResponse {
        $integracion = $this->integracion($request);
        $suscripcion = $estado->suscripcion($integracion, $cuenta);
        abort_if($suscripcion === null, 404, 'El cliente no está vinculado a la cobranza.');
        abort_if($preferida !== null && $preferida->empresa_id !== $suscripcion->empresa_id, 404, 'La cuenta no pertenece a este cliente.');

        $extra = $request->validate(['reportado_nombre' => ['nullable', 'string', 'max:120']]);
        $clave = $request->header('Idempotency-Key') ?? $request->validated('clave_idempotencia');
        $datos = [...$request->validated(), ...$extra];
        $datos['clave_idempotencia'] = is_string($clave) && trim($clave) !== ''
            ? mb_substr('i'.$integracion->id.':'.trim($clave), 0, 80)
            : null;

        $servicio->reportar(
            $suscripcion->empresa,
            $datos,
            $request->file('captura'),
            null,
            PaymentReport::ORIGEN_SISTEMA,
            $integracion,
            $preferida,
        );

        return response()->json($estado->estado($suscripcion->refresh(), CarbonImmutable::today()), 201);
    }

    private function integracion(Request $request): Integration
    {
        $integracion = $request->attributes->get(AuthenticateIntegration::ATRIBUTO);
        abort_unless($integracion instanceof Integration, 401);

        return $integracion;
    }
}
