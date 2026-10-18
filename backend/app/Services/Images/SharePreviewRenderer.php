<?php

declare(strict_types=1);

namespace App\Services\Images;

use GdImage;
use RuntimeException;

class SharePreviewRenderer
{
    public const VERSION = 2;

    public const ANCHO = 1200;

    public const ALTO = 630;

    private const MARGEN = 28;

    private const ANCHO_DIFUMINADO = 64;

    private const FACTOR_INTERMEDIO = 5;

    private const PASADAS_DIFUMINADO = 6;

    private const CALIDAD = 86;

    public function generar(string $origen, string $destino): void
    {
        $contenido = file_get_contents($origen);
        $fuente = $contenido === false ? false : imagecreatefromstring($contenido);

        if (! $fuente instanceof GdImage) {
            throw new RuntimeException('No se pudo leer la imagen de origen.');
        }

        $lienzo = $this->lienzo(self::ANCHO, self::ALTO);
        $this->pintarFondo($lienzo, $fuente);
        $this->pintarImagen($lienzo, $fuente);

        $carpeta = dirname($destino);
        if (! is_dir($carpeta) && ! mkdir($carpeta, 0755, true) && ! is_dir($carpeta)) {
            throw new RuntimeException('No se pudo crear la carpeta de vistas para compartir.');
        }

        $temporal = $destino.'.'.bin2hex(random_bytes(4)).'.tmp';
        if (! imagejpeg($lienzo, $temporal, self::CALIDAD) || ! rename($temporal, $destino)) {
            @unlink($temporal);
            throw new RuntimeException('No se pudo guardar la vista para compartir.');
        }
    }

    private function pintarFondo(GdImage $lienzo, GdImage $fuente): void
    {
        $anchoFuente = imagesx($fuente);
        $altoFuente = imagesy($fuente);
        $escala = max(self::ANCHO / $anchoFuente, self::ALTO / $altoFuente);
        $anchoVisible = (int) round(self::ANCHO / $escala);
        $altoVisible = (int) round(self::ALTO / $escala);

        $altoDifuminado = (int) round(self::ANCHO_DIFUMINADO * self::ALTO / self::ANCHO);
        $pequena = $this->lienzo(self::ANCHO_DIFUMINADO, $altoDifuminado);
        imagecopyresampled(
            $pequena,
            $fuente,
            0,
            0,
            (int) (($anchoFuente - $anchoVisible) / 2),
            (int) (($altoFuente - $altoVisible) / 2),
            self::ANCHO_DIFUMINADO,
            $altoDifuminado,
            $anchoVisible,
            $altoVisible,
        );

        $this->difuminar($pequena);

        $anchoMedio = self::ANCHO_DIFUMINADO * self::FACTOR_INTERMEDIO;
        $altoMedio = $altoDifuminado * self::FACTOR_INTERMEDIO;
        $intermedia = $this->lienzo($anchoMedio, $altoMedio);
        imagecopyresampled($intermedia, $pequena, 0, 0, 0, 0, $anchoMedio, $altoMedio, self::ANCHO_DIFUMINADO, $altoDifuminado);
        $this->difuminar($intermedia);
        $this->difuminar($intermedia);

        imagecopyresampled($lienzo, $intermedia, 0, 0, 0, 0, self::ANCHO, self::ALTO, $anchoMedio, $altoMedio);
        imagefilledrectangle($lienzo, 0, 0, self::ANCHO, self::ALTO, $this->color($lienzo, 15, 29, 46, 55));
    }

    private function pintarImagen(GdImage $lienzo, GdImage $fuente): void
    {
        $anchoFuente = imagesx($fuente);
        $altoFuente = imagesy($fuente);
        $escala = min((self::ANCHO - self::MARGEN * 2) / $anchoFuente, (self::ALTO - self::MARGEN * 2) / $altoFuente);
        $ancho = (int) round($anchoFuente * $escala);
        $alto = (int) round($altoFuente * $escala);
        $x = (int) ((self::ANCHO - $ancho) / 2);
        $y = (int) ((self::ALTO - $alto) / 2);

        imagefilledrectangle($lienzo, $x - 6, $y + 4, $x + $ancho + 6, $y + $alto + 12, $this->color($lienzo, 0, 0, 0, 90));
        imagecopyresampled($lienzo, $fuente, $x, $y, 0, 0, $ancho, $alto, $anchoFuente, $altoFuente);
    }

    private function difuminar(GdImage $imagen): void
    {
        for ($pasada = 0; $pasada < self::PASADAS_DIFUMINADO; $pasada++) {
            imagefilter($imagen, IMG_FILTER_GAUSSIAN_BLUR);
        }
    }

    private function lienzo(int $ancho, int $alto): GdImage
    {
        $imagen = imagecreatetruecolor(max(1, $ancho), max(1, $alto));

        if (! $imagen instanceof GdImage) {
            throw new RuntimeException('No se pudo crear el lienzo.');
        }

        imagealphablending($imagen, true);

        return $imagen;
    }

    private function color(GdImage $imagen, int $rojo, int $verde, int $azul, int $transparencia): int
    {
        $color = imagecolorallocatealpha($imagen, $rojo, $verde, $azul, $transparencia);

        if ($color === false) {
            throw new RuntimeException('No se pudo crear el color.');
        }

        return $color;
    }
}
