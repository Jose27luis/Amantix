import { Product } from '../models/product.model';

export const PRODUCTS: readonly Product[] = [
  {
    slug: 'facturador-amantix',
    code: '01 · FACTURADOR',
    systemRef: 'pro8',
    name: 'Facturador Amantix',
    shortDescription:
      'Comprobantes electrónicos, GRE y SIRE conectados a SUNAT, con inventario y POS. Multi-tenant por RUC.',
    description:
      'Sistema de facturación electrónica integral para Perú, conectado a SUNAT. Cada empresa opera con su propio RUC y base de datos aislada.',
    image: '/productos/prod-facturador.png',
    heroImage: '/productos/facturador/facturador-hero.png',
    features: [
      {
        title: 'Comprobantes y guías',
        description: 'Factura, boleta, notas de crédito y débito, y guías de remisión electrónica (GRE).',
      },
      {
        title: 'SIRE',
        description: 'Extracción del registro de compras y ventas electrónico directamente desde SUNAT.',
      },
      {
        title: 'Inventario y POS',
        description: 'Almacenes, listas de precios, punto de venta, reportes y panel del contador.',
      },
    ],
    screenshots: [
      {
        title: 'Comprobantes conectados a SUNAT',
        description:
          'Emite y consulta facturas, boletas y notas; descarga XML y PDF, y valida en lote. El estado de cada comprobante se sincroniza con SUNAT en producción.',
        image: '/productos/facturador/facturador-comprobantes.png',
      },
      {
        title: 'SIRE — registro de compras y ventas',
        description:
          'Importa el XML descargado desde SUNAT y crea los productos en el catálogo automáticamente, con base imponible e IGV calculados.',
        image: '/productos/facturador/facturador-sire.png',
      },
      {
        title: 'Punto de venta ágil',
        description:
          'Vende por categorías, arma el carrito, cambia de moneda y cobra en segundos. Pensado para mostrador y atención rápida.',
        image: '/productos/facturador/facturador-pos.png',
      },
      {
        title: 'Módulo de hotel y recepción',
        description:
          'Vista general de recepción: ocupación, check-in y check-out, estados de habitación e ingresos del día. Un sistema para varios giros de negocio.',
        image: '/productos/facturador/facturador-hotel.png',
      },
    ],
    productionUrl: 'https://facturito.tokefact.pe',
  },
  {
    slug: 'restaurant-sumaqta',
    code: '02 · SUMAQTA',
    systemRef: 'mozo4',
    name: 'Restaurant Sumaqta',
    shortDescription:
      'Punto de venta gastronómico: comandas desde el móvil, impresión en cocina y caja, mesas y carta.',
    description:
      'Sistema de gestión para restaurantes. El mozo toma la comanda desde el celular y la cocina o caja la imprime al instante.',
    image: '/productos/prod-restaurante.png',
    heroImage: '/productos/restaurante/sumaqta-hero.png',
    features: [
      {
        title: 'Comandas móviles',
        description: 'El mozo registra el pedido desde su celular; la PC con la app imprime en cocina vía QZ Tray.',
      },
      {
        title: 'Mesas y carta',
        description: 'Gestión de salones, mesas, carta, pedidos y cuentas en tiempo real.',
      },
      {
        title: 'Facturación integrada',
        description: 'Emite el comprobante electrónico al cerrar la cuenta, conectado a SUNAT.',
      },
    ],
    screenshots: [
      {
        title: 'Punto de venta por carta',
        description:
          'Arma el pedido tocando los platos por categoría, controla el stock disponible y envía la comanda a cocina en segundos.',
        image: '/productos/restaurante/sumaqta-pos.png',
      },
      {
        title: 'División de cuentas por comensal',
        description:
          'Reparte los productos de la mesa entre varias personas, factura a cada una por separado o cobra el restante.',
        image: '/productos/restaurante/sumaqta-division.png',
      },
      {
        title: 'Cobro con boleta electrónica',
        description:
          'Elige boleta o factura, registra el pago y emite el comprobante electrónico al instante, conectado a SUNAT.',
        image: '/productos/restaurante/sumaqta-cobro.png',
      },
      {
        title: 'Historial de mesas',
        description:
          'Consulta la actividad de cada mesa por rango de fechas: cuáles tuvieron movimiento y cuántas ventas, con acceso a su historial.',
        image: '/productos/restaurante/sumaqta-historial-mesas.png',
      },
      {
        title: 'Para llevar y delivery',
        description:
          'Registra y consulta las ventas para llevar con su comanda, canal y total del día, separadas del salón.',
        image: '/productos/restaurante/sumaqta-delivery.png',
      },
      {
        title: 'Carta y productos',
        description:
          'Administra la carta con precios, categorías, stock y visibilidad de cada plato en el restaurante.',
        image: '/productos/restaurante/sumaqta-carta.png',
      },
      {
        title: 'Control de insumos',
        description:
          'Lleva el stock de insumos con costo, merma y stock mínimo, con historial de movimientos por insumo.',
        image: '/productos/restaurante/sumaqta-insumos.png',
      },
    ],
    productionUrl: 'https://sumaq.tokefact.pe',
  },
  {
    slug: 'agente-amantix',
    code: '03 · AGENTE',
    systemRef: 'agente',
    name: 'Agente Amantix',
    shortDescription:
      'Plataforma para agentes multibancarios: caja por billeteras, boletas SUNAT, préstamos y cierre diario.',
    description:
      'Plataforma SaaS para operar agentes multibancarios en Perú. Multi-tenant por subdominio, cada empresa con su base de datos aislada.',
    image: '/productos/prod-agente.png',
    heroImage: '',
    features: [
      {
        title: 'Caja multibilletera',
        description: 'Ingreso y salida de dinero contra BBVA, BCP, Yape, Plin, Western Union y efectivo.',
      },
      {
        title: 'Préstamos y boletas',
        description: 'Otorga préstamos y emite boletas SUNAT desde la misma operación.',
      },
      {
        title: 'Cierre de caja diario',
        description: 'Cuadre por billetera y cierre diario pensado para no perder un sol.',
      },
    ],
    screenshots: [],
    productionUrl: 'https://agente.tokefacts.com',
  },
];
