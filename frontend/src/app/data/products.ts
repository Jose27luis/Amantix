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
    productionUrl: 'https://agente.tokefacts.com',
  },
];
