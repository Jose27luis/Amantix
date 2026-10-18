<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Services\Images\ImageStore;
use App\Services\Images\SharePreviewRenderer;
use Illuminate\Support\Facades\Storage;

class NewsImageStore extends ImageStore
{
    private const CARPETA_COMPARTIR = 'noticias/compartir';

    public function __construct(private readonly SharePreviewRenderer $vistas)
    {
    }

    public function borrar(string $nombre): void
    {
        parent::borrar($nombre);
        Storage::disk(self::DISCO)->delete($this->rutaCompartir($nombre));
    }

    public function rutaAbsolutaCompartir(string $nombre): string
    {
        $destino = Storage::disk(self::DISCO)->path($this->rutaCompartir($nombre));
        $origen = $this->rutaAbsoluta($nombre);

        if (! is_file($destino) || filemtime($destino) < filemtime($origen)) {
            $this->vistas->generar($origen, $destino);
        }

        return $destino;
    }

    protected function carpeta(): string
    {
        return 'noticias';
    }

    private function rutaCompartir(string $nombre): string
    {
        return self::CARPETA_COMPARTIR.'/'.pathinfo(basename($nombre), PATHINFO_FILENAME).'.jpg';
    }
}
