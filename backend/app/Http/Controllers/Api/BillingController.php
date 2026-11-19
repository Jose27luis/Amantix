<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\PaymentReportStatus;
use App\Enums\ReceivableStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\AcceptPaymentRequest;
use App\Http\Requests\ReasonRequest;
use App\Http\Requests\ReceivableIndexRequest;
use App\Http\Requests\ReportPaymentRequest;
use App\Http\Requests\StoreReceivableRequest;
use App\Http\Requests\UpdateReceivableRequest;
use App\Http\Resources\PaymentReportResource;
use App\Http\Resources\ReceivableResource;
use App\Models\Company;
use App\Models\PaymentReport;
use App\Models\Receivable;
use App\Models\User;
use App\Services\Billing\BillingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BillingController extends Controller
{
    private const RELACIONES_CUENTA = ['empresa', 'suscripcion.producto', 'aplicaciones.pago.comprobante'];
    private const RELACIONES_PAGO = ['empresa', 'cuenta', 'metodoPago', 'reportadoPor', 'revisadoPor', 'aplicaciones.cuenta', 'comprobante'];

    public function resumen(): JsonResponse
    {
        $porCobrar = Receivable::query()->whereIn('estado', ReceivableStatus::cobrables());
        $vencidas = (clone $porCobrar)->whereDate('vence', '<', today());

        return response()->json([
            'por_cobrar' => round((float) (clone $porCobrar)->sum(DB::raw('monto - monto_pagado')), 2),
            'cuentas_por_cobrar' => (clone $porCobrar)->count(),
            'vencidas' => (clone $vencidas)->count(),
            'monto_vencido' => round((float) (clone $vencidas)->sum(DB::raw('monto - monto_pagado')), 2),
            'pagos_en_revision' => PaymentReport::query()->where('estado', PaymentReportStatus::EnRevision)->count(),
            'cobrado_mes' => round((float) PaymentReport::query()
                ->where('estado', PaymentReportStatus::Aceptado)
                ->where('revisado_at', '>=', now()->startOfMonth())
                ->sum('monto'), 2),
        ]);
    }

    public function index(ReceivableIndexRequest $request): AnonymousResourceCollection
    {
        $filtros = $request->validated();

        $consulta = Receivable::query()
            ->with(self::RELACIONES_CUENTA)
            ->when($filtros['empresa_id'] ?? null, fn (Builder $q, int|string $id) => $q->where('empresa_id', (int) $id))
            ->when($filtros['buscar'] ?? null, function (Builder $q, string $texto): void {
                $q->where(function (Builder $sub) use ($texto): void {
                    $sub->where('concepto', 'like', "%{$texto}%")
                        ->orWhereHas('empresa', fn (Builder $e) => $e->where('razon_social', 'like', "%{$texto}%")->orWhere('ruc', 'like', "{$texto}%"));
                });
            });

        $estado = $filtros['estado'] ?? 'por_cobrar';
        match ($estado) {
            'por_cobrar' => $consulta->whereIn('estado', ReceivableStatus::cobrables()),
            'vencidas' => $consulta->whereIn('estado', ReceivableStatus::cobrables())->whereDate('vence', '<', today()),
            'pendiente' => $consulta->whereIn('estado', [ReceivableStatus::Pendiente, ReceivableStatus::EnRevision]),
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

        return response()->json(ReceivableResource::make($cuenta->load(self::RELACIONES_CUENTA))->resolve($request), 201);
    }

    public function update(UpdateReceivableRequest $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $cuenta = $servicio->editar($receivable, $request->validated(), $this->usuario($request));

        return response()->json(ReceivableResource::make($cuenta->load(self::RELACIONES_CUENTA))->resolve($request));
    }

    public function anular(ReasonRequest $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $cuenta = $servicio->anular($receivable, (string) $request->validated('motivo'), $this->usuario($request));

        return response()->json(ReceivableResource::make($cuenta->load(self::RELACIONES_CUENTA))->resolve($request));
    }

    public function cobrar(ReportPaymentRequest $request, Receivable $receivable, BillingService $servicio): JsonResponse
    {
        $pago = $servicio->registrarCobro(
            $receivable->empresa()->firstOrFail(),
            $request->validated(),
            $request->file('captura'),
            $this->usuario($request),
            $receivable,
        );

        return response()->json(PaymentReportResource::make($pago->load(self::RELACIONES_PAGO))->resolve($request), 201);
    }

    public function pagos(Request $request): AnonymousResourceCollection
    {
        $filtros = $request->validate([
            'estado' => ['nullable', Rule::enum(PaymentReportStatus::class)],
            'empresa_id' => ['nullable', 'integer'],
            'buscar' => ['nullable', 'string', 'max:120'],
        ]);

        $estado = PaymentReportStatus::from($filtros['estado'] ?? PaymentReportStatus::EnRevision->value);

        $pagos = PaymentReport::query()
            ->with(self::RELACIONES_PAGO)
            ->where('estado', $estado)
            ->when($filtros['empresa_id'] ?? null, fn (Builder $q, int|string $id) => $q->where('empresa_id', (int) $id))
            ->when($filtros['buscar'] ?? null, fn (Builder $q, string $texto) => $q->where(fn (Builder $sub) => $sub
                ->where('numero_operacion', 'like', "%{$texto}%")
                ->orWhereHas('empresa', fn (Builder $e) => $e->where('razon_social', 'like', "%{$texto}%")->orWhere('ruc', 'like', "{$texto}%"))))
            ->orderBy('created_at', $estado === PaymentReportStatus::EnRevision ? 'asc' : 'desc')
            ->paginate(20);

        $this->conDeuda($pagos->getCollection());

        return PaymentReportResource::collection($pagos);
    }

    public function pendientes(Request $request): JsonResponse
    {
        $consulta = PaymentReport::query()->where('estado', PaymentReportStatus::EnRevision);
        $ultimos = (clone $consulta)->with(['empresa', 'metodoPago'])->latest()->limit(6)->get();

        return response()->json([
            'total' => $consulta->count(),
            'data' => PaymentReportResource::collection($ultimos)->resolve($request),
        ]);
    }

    public function aceptar(AcceptPaymentRequest $request, PaymentReport $payment, BillingService $servicio): JsonResponse
    {
        $pago = $servicio->aceptar($payment, $this->usuario($request), array_filter(
            $request->validated(),
            static fn (mixed $valor): bool => $valor !== null,
        ));

        return response()->json(PaymentReportResource::make($pago->load(self::RELACIONES_PAGO))->resolve($request));
    }

    public function rechazar(ReasonRequest $request, PaymentReport $payment, BillingService $servicio): JsonResponse
    {
        $pago = $servicio->rechazar($payment, (string) $request->validated('motivo'), $this->usuario($request));

        return response()->json(PaymentReportResource::make($pago->load(self::RELACIONES_PAGO))->resolve($request));
    }

    public function emitir(Request $request, PaymentReport $payment, BillingService $servicio): JsonResponse
    {
        $servicio->reemitir($payment, $this->usuario($request));

        return response()->json(PaymentReportResource::make($payment->refresh()->load(self::RELACIONES_PAGO))->resolve($request));
    }

    public function estadoCuenta(Request $request, Company $company, BillingService $servicio): JsonResponse
    {
        $cuentas = $company->cuentasPorCobrar()
            ->with(['suscripcion.producto', 'aplicaciones.pago.comprobante'])
            ->orderByDesc('vence')
            ->orderByDesc('id')
            ->limit(60)
            ->get();

        $pagos = PaymentReport::query()
            ->with(self::RELACIONES_PAGO)
            ->where('empresa_id', $company->id)
            ->latest()
            ->limit(60)
            ->get();

        return response()->json([
            'deuda' => $servicio->deuda($company),
            'pagado_total' => round((float) $pagos->where('estado', PaymentReportStatus::Aceptado)->sum('monto'), 2),
            'cuentas' => ReceivableResource::collection($cuentas)->resolve($request),
            'pagos' => PaymentReportResource::collection($pagos)->resolve($request),
        ]);
    }

    private function conDeuda(Collection $pagos): void
    {
        $empresas = $pagos->pluck('empresa_id')->unique()->values();
        if ($empresas->isEmpty()) {
            return;
        }

        $deudas = Receivable::query()
            ->whereIn('empresa_id', $empresas)
            ->whereIn('estado', ReceivableStatus::cobrables())
            ->groupBy('empresa_id')
            ->selectRaw('empresa_id, SUM(monto - monto_pagado) as deuda')
            ->pluck('deuda', 'empresa_id');

        $pagos->each(fn (PaymentReport $pago) => $pago->setAttribute('deuda_empresa', (float) ($deudas[$pago->empresa_id] ?? 0)));
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
