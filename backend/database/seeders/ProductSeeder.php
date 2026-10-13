<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->productos() as $orden => $producto) {
            Product::query()->updateOrCreate(
                ['slug' => $producto['slug']],
                [...$producto, 'orden' => $orden + 1, 'visible' => true],
            );
        }
    }

    private function productos(): array
    {
        return [
            [
                'slug' => 'facturador-amantix',
                'codigo' => '01 · FACTURADOR',
                'sistema' => 'pro8',
                'nombre' => 'Facturador Amantix',
                'descripcion_corta' => 'Comprobantes electrónicos, GRE y SIRE conectados a SUNAT, con inventario y POS. Multi-tenant por RUC.',
                'descripcion' => 'Sistema de facturación electrónica integral para Perú, conectado a SUNAT. Cada empresa opera con su propio RUC y base de datos aislada.',
                'imagen' => '/productos/prod-facturador.png',
                'imagen_hero' => '/productos/facturador/facturador-hero.png',
                'funcionalidades' => [
                    ['titulo' => 'Comprobantes y guías', 'descripcion' => 'Factura, boleta, notas de crédito y débito, y guías de remisión electrónica (GRE).'],
                    ['titulo' => 'SIRE', 'descripcion' => 'Extracción del registro de compras y ventas electrónico directamente desde SUNAT.'],
                    ['titulo' => 'Inventario y POS', 'descripcion' => 'Almacenes, listas de precios, punto de venta, reportes y panel del contador.'],
                ],
                'capturas' => [
                    ['titulo' => 'Comprobantes conectados a SUNAT', 'descripcion' => 'Emite y consulta facturas, boletas y notas; descarga XML y PDF, y valida en lote. El estado de cada comprobante se sincroniza con SUNAT en producción.', 'imagen' => '/productos/facturador/facturador-comprobantes.png'],
                    ['titulo' => 'SIRE — registro de compras y ventas', 'descripcion' => 'Importa el XML descargado desde SUNAT y crea los productos en el catálogo automáticamente, con base imponible e IGV calculados.', 'imagen' => '/productos/facturador/facturador-sire.png'],
                    ['titulo' => 'Punto de venta ágil', 'descripcion' => 'Vende por categorías, arma el carrito, cambia de moneda y cobra en segundos. Pensado para mostrador y atención rápida.', 'imagen' => '/productos/facturador/facturador-pos.png'],
                    ['titulo' => 'Módulo de hotel y recepción', 'descripcion' => 'Vista general de recepción: ocupación, check-in y check-out, estados de habitación e ingresos del día. Un sistema para varios giros de negocio.', 'imagen' => '/productos/facturador/facturador-hotel.png'],
                ],
                'url_produccion' => 'https://facturito.tokefact.pe',
            ],
            [
                'slug' => 'restaurant-sumaqta',
                'codigo' => '02 · SUMAQTA',
                'sistema' => 'mozo4',
                'nombre' => 'Restaurant Sumaqta',
                'descripcion_corta' => 'Punto de venta gastronómico: comandas desde el móvil, impresión en cocina y caja, mesas y carta.',
                'descripcion' => 'Sistema de gestión para restaurantes. El mozo toma la comanda desde el celular y la cocina o caja la imprime al instante.',
                'imagen' => '/productos/prod-restaurante.png',
                'imagen_hero' => '/productos/restaurante/sumaqta-hero.png',
                'funcionalidades' => [
                    ['titulo' => 'Comandas móviles', 'descripcion' => 'El mozo registra el pedido desde su celular; la PC con la app imprime en cocina vía QZ Tray.'],
                    ['titulo' => 'Mesas y carta', 'descripcion' => 'Gestión de salones, mesas, carta, pedidos y cuentas en tiempo real.'],
                    ['titulo' => 'Facturación integrada', 'descripcion' => 'Emite el comprobante electrónico al cerrar la cuenta, conectado a SUNAT.'],
                ],
                'capturas' => [
                    ['titulo' => 'Punto de venta por carta', 'descripcion' => 'Arma el pedido tocando los platos por categoría, controla el stock disponible y envía la comanda a cocina en segundos.', 'imagen' => '/productos/restaurante/sumaqta-pos.png'],
                    ['titulo' => 'División de cuentas por comensal', 'descripcion' => 'Reparte los productos de la mesa entre varias personas, factura a cada una por separado o cobra el restante.', 'imagen' => '/productos/restaurante/sumaqta-division.png'],
                    ['titulo' => 'Cobro con boleta electrónica', 'descripcion' => 'Elige boleta o factura, registra el pago y emite el comprobante electrónico al instante, conectado a SUNAT.', 'imagen' => '/productos/restaurante/sumaqta-cobro.png'],
                    ['titulo' => 'Historial de mesas', 'descripcion' => 'Consulta la actividad de cada mesa por rango de fechas: cuáles tuvieron movimiento y cuántas ventas, con acceso a su historial.', 'imagen' => '/productos/restaurante/sumaqta-historial-mesas.png'],
                    ['titulo' => 'Para llevar y delivery', 'descripcion' => 'Registra y consulta las ventas para llevar con su comanda, canal y total del día, separadas del salón.', 'imagen' => '/productos/restaurante/sumaqta-delivery.png'],
                    ['titulo' => 'Carta y productos', 'descripcion' => 'Administra la carta con precios, categorías, stock y visibilidad de cada plato en el restaurante.', 'imagen' => '/productos/restaurante/sumaqta-carta.png'],
                    ['titulo' => 'Control de insumos', 'descripcion' => 'Lleva el stock de insumos con costo, merma y stock mínimo, con historial de movimientos por insumo.', 'imagen' => '/productos/restaurante/sumaqta-insumos.png'],
                ],
                'url_produccion' => 'https://sumaq.tokefact.pe',
            ],
            [
                'slug' => 'agente-amantix',
                'codigo' => '03 · AGENTE',
                'sistema' => 'agente',
                'nombre' => 'Agente Amantix',
                'descripcion_corta' => 'Plataforma para agentes multibancarios: caja por billeteras, boletas SUNAT, préstamos y cierre diario.',
                'descripcion' => 'Plataforma SaaS para operar agentes multibancarios en Perú. Multi-tenant por subdominio, cada empresa con su base de datos aislada.',
                'imagen' => '/productos/prod-agente.png',
                'imagen_hero' => '/productos/agente/agente-hero.png',
                'funcionalidades' => [
                    ['titulo' => 'Caja multibilletera', 'descripcion' => 'Ingreso y salida de dinero contra BBVA, BCP, Yape, Plin, Western Union y efectivo.'],
                    ['titulo' => 'Préstamos y boletas', 'descripcion' => 'Otorga préstamos y emite boletas SUNAT desde la misma operación.'],
                    ['titulo' => 'Cierre de caja diario', 'descripcion' => 'Cuadre por billetera y cierre diario pensado para no perder un sol.'],
                ],
                'capturas' => [
                    ['titulo' => 'Atención y nueva operación', 'descripcion' => 'Registra depósitos, giros, retiros, pagos de servicio y préstamos contra cualquier billetera: BCP, BBVA, Interbank, Yape, Plin, Tunki y efectivo, con su comisión.', 'imagen' => '/productos/agente/agente-atencion.png'],
                    ['titulo' => 'Historial de operaciones', 'descripcion' => 'Consulta y filtra todas las operaciones por fecha, tipo y billetera, con monto, comisión y estado; exporta a PDF o Excel y reimprime el ticket.', 'imagen' => '/productos/agente/agente-operaciones.png'],
                    ['titulo' => 'Billeteras y fuentes de fondos', 'descripcion' => 'Administra bancos, billeteras digitales y efectivo con su saldo, y agrega nuevas fuentes según tu operación.', 'imagen' => '/productos/agente/agente-billeteras.png'],
                    ['titulo' => 'Reporte y cierre diario', 'descripcion' => 'Resumen del día por billetera y tipo de operación: ingresos, salidas, comisiones y cargos del banco para cuadrar la caja.', 'imagen' => '/productos/agente/agente-reporte.png'],
                ],
                'url_produccion' => 'https://agente.citec.com.pe',
            ],
        ];
    }
}
