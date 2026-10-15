<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\NewsStatus;
use App\Enums\SiteImageLocation;
use App\Enums\SubscriptionStatus;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\SiteImageResource;
use App\Models\News;
use App\Models\Product;
use App\Models\SiteImage;
use App\Models\Subscription;
use App\Models\Ticket;
use App\Services\SiteImages\SiteImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicSiteController extends Controller
{
    private const SEGUNDOS_CACHE = 600;

    public function imagenes(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'ubicacion' => ['required', Rule::enum(SiteImageLocation::class)],
        ]);

        $imagenes = SiteImage::query()
            ->where('ubicacion', $datos['ubicacion'])
            ->where('visible', true)
            ->orderBy('orden')
            ->limit(24)
            ->get();

        return response()->json(['data' => SiteImageResource::collection($imagenes)->resolve($request)]);
    }

    public function archivo(string $archivo, SiteImageStore $archivos): BinaryFileResponse
    {
        abort_unless($archivos->existe($archivo), 404);

        return response()->file($archivos->rutaAbsoluta($archivo), [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function cifras(): JsonResponse
    {
        $cifras = Cache::remember('amantix.cifras-publicas', self::SEGUNDOS_CACHE, static fn (): array => [
            'sistemas' => Product::query()->where('visible', true)->count(),
            'empresas' => Subscription::query()->where('estado', SubscriptionStatus::Activa)->distinct('empresa_id')->count('empresa_id'),
            'noticias' => News::query()->where('estado', NewsStatus::Publicada)->whereNotNull('publicada_en')->count(),
            'tickets_resueltos' => Ticket::query()->whereIn('estado', [TicketStatus::Resuelto, TicketStatus::Cerrado])->count(),
        ]);

        return response()->json($cifras);
    }
}
