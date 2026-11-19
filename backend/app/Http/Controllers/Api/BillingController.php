<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\PaymentReportStatus;
use App\Enums\ReceivableStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReasonRequest;
use App\Http\Requests\ReceivableIndexRequest;
use App\Http\Requests\ReportPaymentRequest;
use App\Http\Requests\StoreReceivableRequest;
use App\Http\Resources\PaymentReportResource;
use App\Http\Resources\ReceivableResource;
use App\Models\Company;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\User;
use App\Services\Billing\BillingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BillingController extends Controller
{
    private const RELACIONES = ['empresa', 'suscripcion.producto', 'pagos.reportadoPor', 'pagos.revisadoPor', 'comprobante'];

    public function resumen(): JsonResponse
    {
        $porCobrar = Receivable::query()->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision]);
        $vencidas = (clone $porCobrar)->whereDate('vence', '<', today());

        return response()->json([
            'por_cobrar' => round((float) (clone $porCobrar)->sum('monto'), 2),
            'cuentas_por_cobrar' => (clone $porCobrar)->count(),
            'vencidas' => (clone $vencidas)->count(),
            'monto_vencido' => round((float) (clone $vencidas)->sum('monto'), 2),
            'pagos_en_revision' => PaymentReport::query()->where('estado', PaymentReportStatus::EnRevision)->count(),
            'cobrado_mes' => round((float) Receivable::query()
                ->where('estado', ReceivableStatus::Pagada)
                ->where('pagada_at', '>=', now()->startOfMonth())
                ->sum('monto'), 2),
        ]);
    }

    public function index(ReceivableIndexRequest $request): AnonymousResourceCollection
    {
        $filtros = $request->validated();

        $consulta = Receivable::query()
            ->with(self::RELACIONES)
            ->when($filtros['empresa_id'] ?? null, fn (Builder $q, int|string $id) => $q->where('empresa_id', (int) $id))
            ->when($filtros['buscar'] ?? null, function (Builder $q, string $texto): void {
                $q->where(function (Builder $sub) use ($texto): void {
                    $sub->where('concepto', 'like', "%{$texto}%")
                        ->orWhereHas('empresa', fn (Builder $e) => $e->where('razon_social', 'like', "%{$texto}%")->orWhere('ruc', 'like', "{$texto}%"));
                });
            });

        $estado = $filtros['estado'] ?? 'por_cobrar';
        match ($estado) {
            'por_cobrar' => $consulta->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision]),
            'vencidas' => $consulta->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision])->whereDate('vence', '<', today()),
            default => $consulta->where('estado', ReceivableStatus::from($estado)),
        };

        $orden = in_array($estado, [ReceivableStatus::Pagada->value, ReceivableStatus::Anulada->value], true) ? 'desc' : 'asc';

        return ReceivableResource::collection($consulta->orderBy('vence', $orden)->orderBy('id', $orden)->paginate(20));
    }

    public function store(StoreReceivableRequest $request, BillingService $servicio): JsonResponse
    {
        $datos = $request->validated();
        $empresa = Company::query()->findOrFail((int) $datos['empresa_id']);
        $cuenta = $servicio->crearManual($empresa, $datos, $this->usuario($request));

        return response()->json(ReceivableResource::make($cuenta->load(self::RELACIONES))->resolve($request), 201);
    }

    public function anular(ReasonRequest $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $cuenta = $servicio->anular($receivable, (string) $request->validated('motivo'), $this->usuario($request));

        return response()->json(ReceivableResource::make($cuenta->load(self::RELACIONES))->resolve($request));
    }

    public function cobrar(ReportPaymentRequest $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $servicio->registrarCobro($receivable, $request->validated(), $request->file('captura'), $this->usuario($request));

        return response()->json(ReceivableResource::make($receivable->refresh()->load(self::RELACIONES))->resolve($request), 201);
    }

    public function emitir(Request $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $servicio->reemitir($receivable, $this->usuario($request));

        return response()->json(ReceivableResource::make($receivable->refresh()->load(self::RELACIONES))->resolve($request));
    }

    public function pagosEnRevision(Request $request): AnonymousResourceCollection
    {
        $pagos = PaymentReport::query()
            ->with(['cuenta.empresa', 'cuenta.suscripcion.producto', 'reportadoPor'])
            ->where('estado', PaymentReportStatus::EnRevision)
            ->orderBy('created_at')
            ->get();

        return PaymentReportResource::collection($pagos);
    }

    public function aceptar(Request $request, PaymentReport $payment, BillingService $servicio): JsonResponse
    {
        $pago = $servicio->aceptar($payment, $this->usuario($request));

        return response()->json(ReceivableResource::make($pago->cuenta()->firstOrFail()->load(self::RELACIONES))->resolve($request));
    }

    public function rechazar(ReasonRequest $request, PaymentReport $payment, BillingService $servicio): JsonResponse
    {
        $pago = $servicio->rechazar($payment, (string) $request->validated('motivo'), $this->usuario($request));

        return response()->json(ReceivableResource::make($pago->cuenta()->firstOrFail()->load(self::RELACIONES))->resolve($request));
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
