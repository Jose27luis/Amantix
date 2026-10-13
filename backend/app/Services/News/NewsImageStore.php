<?php

declare(strict_types=1);

namespace App\Services\News;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class NewsImageStore
{
    public const DISCO = 'local';

    public const CARPETA = 'noticias';

    private const FIRMAS = [
        'jpg' => ["\xFF\xD8\xFF"],
        'png' => ["\x89PNG\r\n\x1A\n"],
        'webp' => ['RIFF'],
    ];

    public function guardar(UploadedFile $archivo): array
    {
        $extension = $this->detectarTipo($archivo);
        $medidas = @getimagesize($archivo->getRealPath());

        if ($medidas === false || $medidas[0] < 200 || $medidas[1] < 200) {
            throw ValidationException::withMessages(['imagen' => 'La imagen debe medir al menos 200 × 200 px.']);
        }

        $nombre = Str::uuid()->toString().'.'.$extension;
        $archivo->storeAs(self::CARPETA, $nombre, self::DISCO);

        return [
            'imagen' => $nombre,
            'imagen_ancho' => (int) $medidas[0],
            'imagen_alto' => (int) $medidas[1],
        ];
    }

    public function borrar(string $nombre): void
    {
        Storage::disk(self::DISCO)->delete(self::CARPETA.'/'.$nombre);
    }

    public function ruta(string $nombre): string
    {
        return self::CARPETA.'/'.basename($nombre);
    }

    private function detectarTipo(UploadedFile $archivo): string
    {
        $manejador = fopen($archivo->getRealPath(), 'rb');
        $cabecera = $manejador === false ? '' : (string) fread($manejador, 12);

        if ($manejador !== false) {
            fclose($manejador);
        }

        foreach (self::FIRMAS as $extension => $firmas) {
            foreach ($firmas as $firma) {
                if (str_starts_with($cabecera, $firma) && ($extension !== 'webp' || substr($cabecera, 8, 4) === 'WEBP')) {
                    return $extension;
                }
            }
        }

        throw ValidationException::withMessages(['imagen' => 'La imagen debe ser JPG, PNG o WEBP.']);
    }
}
