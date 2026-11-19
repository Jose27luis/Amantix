<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentReport;
use App\Models\User;
use App\Services\Billing\PaymentCaptureStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentCaptureController extends Controller
{
    public function __invoke(Request $request, PaymentReport $payment): StreamedResponse
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);
        abort_unless($usuario->esAdministrador() || $usuario->empresa_id === $payment->empresa_id, 404);

        $disco = Storage::disk(PaymentCaptureStore::DISCO);
        abort_if($payment->captura_ruta === null || ! $disco->exists($payment->captura_ruta), 404, 'La captura ya no está disponible.');

        return $disco->response($payment->captura_ruta, 'pago-'.$payment->id.'.'.pathinfo($payment->captura_ruta, PATHINFO_EXTENSION), [
            'Content-Type' => (string) $payment->captura_tipo,
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=600',
        ]);
    }
}
