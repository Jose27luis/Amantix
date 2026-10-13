<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Ticket;
use App\Services\Tickets\AttachmentStore;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    public function show(Ticket $ticket, Attachment $attachment): StreamedResponse
    {
        Gate::authorize('download', [$ticket, $attachment]);

        $disco = Storage::disk(AttachmentStore::DISCO);
        abort_unless($disco->exists($attachment->ruta), 404, 'El archivo ya no está disponible.');

        return $disco->download($attachment->ruta, $attachment->nombre, [
            'Content-Type' => $attachment->tipo,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
