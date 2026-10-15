<?php

declare(strict_types=1);

namespace App\Services\Images;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

abstract class ImageStore
{
    public const DISCO = 'local';

    private const FIRMAS = [
        'jpg' => ["\xFF\xD8\xFF"],
        'png' => ["\x89PNG\r\n\x1A\n"],
        'webp' => ['RIFF'],
    ];

    abstract protected function carpeta(): string;

    public function guardar(UploadedFile $archivo): array
    {
        $extension = $this->detectarTipo($archivo);
        $medidas = @getimagesize($archivo->getRealPath());

        if ($medidas === false || $medidas[0] < 200 || $medidas[1] < 200) {
            throw ValidationException::withMessages(['imagen' => 'La imagen debe medir al menos 200 × 200 px.']);
        }

        $nombre = Str::uuid()->toString().'.'.$extension;
        $archivo->storeAs($this->carpeta(), $nombre, self::DISCO);

        return [
            'archivo' => $nombre,
            'ancho' => (int) $medidas[0],
            'alto' => (int) $medidas[1],
        ];
    }

    public function borrar(string $nombre): void
    {
        Storage::disk(self::DISCO)->delete($this->ruta($nombre));
    }

    public function ruta(string $nombre): string
    {
        return $this->carpeta().'/'.basename($nombre);
    }

    public function existe(string $nombre): bool
    {
        return preg_match('/^[0-9a-f-]{36}\.(jpg|png|webp)$/', $nombre) === 1
            && Storage::disk(self::DISCO)->exists($this->ruta($nombre));
    }

    public function rutaAbsoluta(string $nombre): string
    {
        return Storage::disk(self::DISCO)->path($this->ruta($nombre));
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
