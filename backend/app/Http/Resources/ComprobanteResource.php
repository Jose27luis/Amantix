<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BillingInvoice;
use Illuminate\Http\Request;

class ComprobanteResource
{
    public static function datos(BillingInvoice $comprobante, Request $request): array
    {
        return [
            'tipo' => $comprobante->tipo,
            'numero' => $comprobante->numero,
            'estado' => $comprobante->estado,
            'estado_sunat' => $comprobante->estado_sunat,
            'pdf_url' => $comprobante->pdf_url,
            'error' => $request->user()?->esAdministrador() === true ? $comprobante->error : null,
        ];
    }
}
