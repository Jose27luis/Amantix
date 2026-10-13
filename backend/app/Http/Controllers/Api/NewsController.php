<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\NewsStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Models\User;
use App\Services\News\NewsService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', Rule::enum(NewsStatus::class)],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $pagina = News::query()
            ->with('autor')
            ->when($filtros['buscar'] ?? null, fn (Builder $consulta, string $texto): Builder => $consulta->where('titulo', 'like', '%'.$texto.'%'))
            ->when($filtros['estado'] ?? null, fn (Builder $consulta, string $estado): Builder => $consulta->where('estado', $estado))
            ->orderByRaw('publicada_en is null desc')
            ->orderByDesc('publicada_en')
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json([
            'data' => $pagina->getCollection()
                ->map(fn (News $noticia): array => NewsResource::make($noticia)->sinContenido()->resolve($request))
                ->values(),
            'meta' => [
                'current_page' => $pagina->currentPage(),
                'last_page' => $pagina->lastPage(),
                'per_page' => $pagina->perPage(),
                'total' => $pagina->total(),
                'from' => $pagina->firstItem(),
                'to' => $pagina->lastItem(),
            ],
        ]);
    }

    public function show(Request $request, News $news): JsonResponse
    {
        $news->load('autor');

        return response()->json(NewsResource::make($news)->resolve($request));
    }

    public function store(StoreNewsRequest $request, NewsService $servicio): JsonResponse
    {
        $imagen = $request->file('imagen');
        abort_unless($imagen instanceof UploadedFile, 422, 'Adjunta una imagen.');

        $noticia = $servicio->crear($request->safe()->except('imagen'), $imagen, $this->autor($request));
        $noticia->load('autor');

        return response()->json(NewsResource::make($noticia)->resolve($request), 201);
    }

    public function update(UpdateNewsRequest $request, News $news, NewsService $servicio): JsonResponse
    {
        $imagen = $request->file('imagen');

        $noticia = $servicio->actualizar(
            $news,
            $request->safe()->except('imagen'),
            $imagen instanceof UploadedFile ? $imagen : null,
            $this->autor($request),
        );
        $noticia->load('autor');

        return response()->json(NewsResource::make($noticia)->resolve($request));
    }

    public function destroy(Request $request, News $news, NewsService $servicio): Response
    {
        $servicio->borrar($news, $this->autor($request));

        return response()->noContent();
    }

    private function autor(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
