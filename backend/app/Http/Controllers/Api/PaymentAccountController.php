<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentAccountRequest;
use App\Http\Resources\PaymentAccountResource;
use App\Models\PaymentAccount;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use App\Services\Billing\PaymentQrStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        app(PaymentQrStore::class)->quitar($paymentAccount);
        $paymentAccount->delete();

        return response()->noContent();
    }

    public function subirQr(Request $request, PaymentAccount $paymentAccount, PaymentQrStore $qr): JsonResponse
    {
        $request->validate(['qr' => ['required', 'file', 'max:2048', 'mimetypes:image/jpeg,image/png,image/webp']]);
        $qr->guardar($paymentAccount, $request->file('qr'));
        $this->auditoria->registrar($this->usuario($request), 'metodo_pago_qr', $paymentAccount, ['accion' => 'subido']);

        return response()->json(PaymentAccountResource::make($paymentAccount->refresh())->resolve($request));
    }

    public function quitarQr(Request $request, PaymentAccount $paymentAccount, PaymentQrStore $qr): JsonResponse
    {
        $qr->quitar($paymentAccount);
        $this->auditoria->registrar($this->usuario($request), 'metodo_pago_qr', $paymentAccount, ['accion' => 'quitado']);

        return response()->json(PaymentAccountResource::make($paymentAccount->refresh())->resolve($request));
    }

    public function verQr(PaymentAccount $paymentAccount): StreamedResponse
    {
        $disco = Storage::disk(PaymentQrStore::DISCO);
        abort_if(! $paymentAccount->activo || $paymentAccount->qr_ruta === null || ! $disco->exists($paymentAccount->qr_ruta), 404);

        return $disco->response($paymentAccount->qr_ruta, 'qr-'.$paymentAccount->id.'.'.pathinfo($paymentAccount->qr_ruta, PATHINFO_EXTENSION), [
            'Cache-Control' => 'public, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
