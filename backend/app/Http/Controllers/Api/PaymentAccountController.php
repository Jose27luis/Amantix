<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentAccountRequest;
use App\Http\Resources\PaymentAccountResource;
use App\Models\PaymentAccount;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class PaymentAccountController extends Controller
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return PaymentAccountResource::collection(PaymentAccount::query()->orderBy('orden')->orderBy('id')->get());
    }

    public function store(PaymentAccountRequest $request): JsonResponse
    {
        $metodo = PaymentAccount::query()->create($request->validated());
        $this->auditoria->registrar($this->usuario($request), 'metodo_pago_creado', $metodo, ['nombre' => $metodo->nombre]);

        return response()->json(PaymentAccountResource::make($metodo)->resolve($request), 201);
    }

    public function update(PaymentAccountRequest $request, PaymentAccount $paymentAccount): JsonResponse
    {
        $paymentAccount->fill($request->validated());
        $cambios = array_keys($paymentAccount->getDirty());
        $paymentAccount->save();

        if ($cambios !== []) {
            $this->auditoria->registrar($this->usuario($request), 'metodo_pago_actualizado', $paymentAccount, ['campos' => $cambios]);
        }

        return response()->json(PaymentAccountResource::make($paymentAccount)->resolve($request));
    }

    public function destroy(Request $request, PaymentAccount $paymentAccount): Response
    {
        if ($paymentAccount->pagos()->exists()) {
            throw ValidationException::withMessages(['metodo' => 'Este método ya tiene pagos registrados. Desactívalo en lugar de eliminarlo.']);
        }

        $this->auditoria->registrar($this->usuario($request), 'metodo_pago_eliminado', $paymentAccount, ['nombre' => $paymentAccount->nombre]);
        $paymentAccount->delete();

        return response()->noContent();
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
