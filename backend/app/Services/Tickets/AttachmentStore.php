<?php

declare(strict_types=1);

namespace App\Services\Tickets;

use App\Models\Attachment;
use App\Models\TicketMessage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class AttachmentStore
{
    public const DISCO = 'local';

    public function guardar(TicketMessage $mensaje, array $archivos): void
    {
        foreach ($archivos as $archivo) {
            if (! $archivo instanceof UploadedFile) {
                continue;
            }

            $extension = $archivo->guessExtension() ?? $archivo->getClientOriginalExtension();
            $ruta = $archivo->storeAs(
                'tickets/'.$mensaje->ticket_id,
                Str::uuid()->toString().'.'.$extension,
                self::DISCO,
            );

            Attachment::query()->create([
                'mensaje_ticket_id' => $mensaje->id,
                'nombre' => Str::limit($archivo->getClientOriginalName(), 190, ''),
                'ruta' => $ruta,
                'tipo' => (string) $archivo->getMimeType(),
                'tamano' => (int) $archivo->getSize(),
            ]);
        }
    }
}
