<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PaymentAccount;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $metodo = $this->resource;

        if (! $metodo instanceof PaymentAccount) {
            return [];
        }

        return [
            'id' => $metodo->id,
            'nombre' => $metodo->nombre,
            'tipo' => $metodo->tipo->value,
            'titular' => $metodo->titular,
            'numero' => $metodo->numero,
            'cci' => $metodo->cci,
            'instrucciones' => $metodo->instrucciones,
            'activo' => $metodo->activo,
            'orden' => $metodo->orden,
        ];
    }
}
