<?php

declare(strict_types=1);

namespace App\Enums;

enum SiteImageLocation: string
{
    case Inicio = 'inicio';
    case Nosotros = 'nosotros';
    case FacturadorAmantix = 'facturador-amantix';
    case RestaurantSumaqta = 'restaurant-sumaqta';
    case AgenteAmantix = 'agente-amantix';
    case FacturacionPuertoMaldonado = 'facturacion-electronica-puerto-maldonado';
    case RestaurantesMadreDeDios = 'sistema-restaurantes-madre-de-dios';
    case AgentesPuertoMaldonado = 'sistema-agentes-bancarios-puerto-maldonado';
    case FarmaciasMadreDeDios = 'sistema-farmacias-boticas-madre-de-dios';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Inicio => 'Inicio',
            self::Nosotros => 'Nosotros',
            self::FacturadorAmantix => 'Producto: Facturador Amantix',
            self::RestaurantSumaqta => 'Producto: Restaurant Sumaqta',
            self::AgenteAmantix => 'Producto: Agente Amantix',
            self::FacturacionPuertoMaldonado => 'Solución: Facturación electrónica en Puerto Maldonado',
            self::RestaurantesMadreDeDios => 'Solución: Restaurantes en Madre de Dios',
            self::AgentesPuertoMaldonado => 'Solución: Agentes bancarios en Puerto Maldonado',
            self::FarmaciasMadreDeDios => 'Solución: Farmacias y boticas en Madre de Dios',
        };
    }
}
