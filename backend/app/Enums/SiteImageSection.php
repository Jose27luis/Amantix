<?php

declare(strict_types=1);

namespace App\Enums;

enum SiteImageSection: string
{
    case Galeria = 'galeria';
    case Portada = 'portada';
    case Control = 'control';
    case Beneficio1 = 'beneficio-1';
    case Beneficio2 = 'beneficio-2';
    case Beneficio3 = 'beneficio-3';
    case Beneficio4 = 'beneficio-4';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Galeria => 'Galería',
            self::Portada => 'Portada',
            self::Control => 'Lo que vas a controlar',
            self::Beneficio1 => 'Beneficio 1',
            self::Beneficio2 => 'Beneficio 2',
            self::Beneficio3 => 'Beneficio 3',
            self::Beneficio4 => 'Beneficio 4',
        };
    }
}
