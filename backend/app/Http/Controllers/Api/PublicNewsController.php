<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Services\News\NewsImageStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicNewsController extends Controller
{
    private const POR_PAGINA = 9;

    public function index(Request $request): JsonResponse
    {
        $datos = $request->validate(['page' => ['nullable', 'integer', 'min:1', 'max:1000']]);

        $pagina = News::query()
            ->publicadas()
            ->orderByDesc('publicada_en')
            ->paginate(self::POR_PAGINA, ['*'], 'page', (int) ($datos['page'] ?? 1));

        return response()->json([
            'data' => $pagina->getCollection()
                ->map(fn (News $noticia): array => NewsResource::make($noticia)->sinContenido()->resolve($request))
                ->values(),
            'meta' => [
                'current_page' => $pagina->currentPage(),
                'last_page' => $pagina->lastPage(),
                'total' => $pagina->total(),
            ],
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $noticia = News::query()->publicadas()->with('autor')->where('slug', $slug)->first();
        abort_if($noticia === null, 404, 'Esta noticia no existe o ya no está publicada.');

        $relacionadas = News::query()
            ->publicadas()
            ->whereKeyNot($noticia->id)
            ->orderByDesc('publicada_en')
            ->limit(3)
            ->get();

        return response()->json([
            'noticia' => NewsResource::make($noticia)->resolve($request),
            'relacionadas' => $relacionadas
                ->map(fn (News $item): array => NewsResource::make($item)->sinContenido()->resolve($request))
                ->values(),
        ]);
    }

    public function imagen(string $archivo, NewsImageStore $imagenes): BinaryFileResponse
    {
        abort_unless(preg_match('/^[0-9a-f-]{36}\.(jpg|png|webp)$/', $archivo) === 1, 404);

        $disco = Storage::disk(NewsImageStore::DISCO);
        $ruta = $imagenes->ruta($archivo);
        abort_unless($disco->exists($ruta), 404);

        return response()->file($disco->path($ruta), [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
