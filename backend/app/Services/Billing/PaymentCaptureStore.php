<?php

declare(strict_types=1);

namespace App\Services\Billing;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class PaymentCaptureStore
{
    public const DISCO = 'local';

    public function guardar(int $empresaId, UploadedFile $archivo): array
    {
        $extension = $archivo->guessExtension() ?? $archivo->getClientOriginalExtension();
        $ruta = $archivo->storeAs('cobranza/'.$empresaId, Str::uuid()->toString().'.'.$extension, self::DISCO);

        return [
            'captura_ruta' => $ruta,
            'captura_tipo' => (string) $archivo->getMimeType(),
        ];
    }
}
