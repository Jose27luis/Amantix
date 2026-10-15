<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\SiteImageLocation;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSiteImageRequest;
use App\Http\Requests\UpdateSiteImageRequest;
use App\Http\Resources\SiteImageResource;
use App\Models\SiteImage;
use App\Models\User;
use App\Services\SiteImages\SiteImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;

class SiteImageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $imagenes = SiteImage::query()->orderBy('ubicacion')->orderBy('orden')->get();

        return response()->json([
            'data' => SiteImageResource::collection($imagenes)->resolve($request),
            'ubicaciones' => array_map(
                static fn (SiteImageLocation $ubicacion): array => ['valor' => $ubicacion->value, 'etiqueta' => $ubicacion->etiqueta()],
                SiteImageLocation::cases(),
            ),
        ]);
    }

    public function store(StoreSiteImageRequest $request, SiteImageService $servicio): JsonResponse
    {
        $archivo = $request->file('imagen');
        abort_unless($archivo instanceof UploadedFile, 422, 'Adjunta una imagen.');

        $imagen = $servicio->crear($request->safe()->except('imagen'), $archivo, $this->autor($request));

        return response()->json(SiteImageResource::make($imagen)->resolve($request), 201);
    }

    public function update(UpdateSiteImageRequest $request, SiteImage $siteImage, SiteImageService $servicio): JsonResponse
    {
        $imagen = $servicio->actualizar($siteImage, $request->validated(), $this->autor($request));

        return response()->json(SiteImageResource::make($imagen)->resolve($request));
    }

    public function destroy(Request $request, SiteImage $siteImage, SiteImageService $servicio): Response
    {
        $servicio->borrar($siteImage, $this->autor($request));

        return response()->noContent();
    }

    private function autor(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
