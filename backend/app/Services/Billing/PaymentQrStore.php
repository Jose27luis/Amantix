<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\PaymentAccount;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PaymentQrStore
{
    public const DISCO = 'local';

    public static function url(PaymentAccount $metodo): ?string
    {
        if ($metodo->qr_ruta === null) {
            return null;
        }

        return rtrim((string) config('app.url'), '/').'/api/payment-accounts/'.$metodo->id.'/qr?v='.$metodo->updated_at?->timestamp;
    }

    public function guardar(PaymentAccount $metodo, UploadedFile $archivo): PaymentAccount
    {
        $anterior = $metodo->qr_ruta;
        $extension = $archivo->guessExtension() ?? 'png';
        $ruta = $archivo->storeAs('qr', Str::uuid()->toString().'.'.$extension, self::DISCO);

        $metodo->forceFill(['qr_ruta' => $ruta])->save();

        if ($anterior !== null && $anterior !== $ruta) {
            Storage::disk(self::DISCO)->delete($anterior);
        }

        return $metodo;
    }

    public function quitar(PaymentAccount $metodo): PaymentAccount
    {
        if ($metodo->qr_ruta !== null) {
            Storage::disk(self::DISCO)->delete($metodo->qr_ruta);
        }

        $metodo->forceFill(['qr_ruta' => null])->save();

        return $metodo;
    }
}
