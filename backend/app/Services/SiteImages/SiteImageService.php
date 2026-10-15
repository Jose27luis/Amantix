<?php

declare(strict_types=1);

namespace App\Services\SiteImages;

use App\Enums\SiteImageLocation;
use App\Models\SiteImage;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Http\UploadedFile;
use Throwable;

class SiteImageService
{
    public function __construct(
        private readonly SiteImageStore $archivos,
        private readonly AuditRecorder $auditoria,
    ) {
    }

    public function crear(array $datos, UploadedFile $imagen, User $autor): SiteImage
    {
        $archivo = $this->archivos->guardar($imagen);
        $ubicacion = SiteImageLocation::from($datos['ubicacion']);

        try {
            $registro = SiteImage::query()->create([
                'ubicacion' => $ubicacion,
                'titulo' => trim($datos['titulo']),
                ...$archivo,
                'orden' => (int) SiteImage::query()->where('ubicacion', $ubicacion)->max('orden') + 1,
                'visible' => true,
            ]);
        } catch (Throwable $error) {
            $this->archivos->borrar($archivo['archivo']);
            throw $error;
        }

        $this->auditoria->registrar($autor, 'imagen_sitio_creada', $registro, ['ubicacion' => $ubicacion->value]);

        return $registro;
    }

    public function actualizar(SiteImage $imagen, array $datos, User $autor): SiteImage
    {
        $imagen->fill($datos);
        $cambios = array_keys($imagen->getDirty());
        $imagen->save();

        if ($cambios !== []) {
            $this->auditoria->registrar($autor, 'imagen_sitio_actualizada', $imagen, ['campos' => $cambios]);
        }

        return $imagen;
    }

    public function borrar(SiteImage $imagen, User $autor): void
    {
        $archivo = $imagen->archivo;
        $this->auditoria->registrar($autor, 'imagen_sitio_borrada', $imagen, ['titulo' => $imagen->titulo]);
        $imagen->delete();
        $this->archivos->borrar($archivo);
    }
}
