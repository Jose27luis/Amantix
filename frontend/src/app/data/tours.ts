export interface PuntoRecorrido {
  readonly x: number;
  readonly y: number;
  readonly titulo: string;
  readonly texto: string;
}

export interface Recorrido {
  readonly imagen: string;
  readonly ancho: number;
  readonly alto: number;
  readonly descripcion: string;
  readonly puntos: readonly PuntoRecorrido[];
}

export const RECORRIDOS: Readonly<Record<string, Recorrido>> = {
  'facturador-amantix': {
    imagen: '/productos/facturador/facturador-hero.png',
    ancho: 1024,
    alto: 458,
    descripcion: 'Panel de administración de Facturador Amantix',
    puntos: [
      { x: 7, y: 48, titulo: 'Menú de módulos', texto: 'Pagos, usuarios, planes, facturación masiva, contabilidad y certificados, a un clic.' },
      { x: 42, y: 40, titulo: 'Tendencia del año', texto: 'Comprobantes generados mes a mes para ver cómo crece tu operación.' },
      { x: 81, y: 28, titulo: 'Clientes activos', texto: 'Cuántas empresas o sucursales están emitiendo con el sistema.' },
      { x: 81, y: 50, titulo: 'Comprobantes emitidos', texto: 'El total acumulado de facturas, boletas y notas enviadas.' },
      { x: 21, y: 82, titulo: 'Espacio y archivos', texto: 'Uso de almacenamiento y los XML y PDF generados, siempre a la vista.' },
      { x: 86, y: 84, titulo: 'Listado de clientes', texto: 'Estado de cada cuenta y su última actividad en el sistema.' },
    ],
  },
  'restaurant-sumaqta': {
    imagen: '/productos/restaurante/sumaqta-hero.png',
    ancho: 1500,
    alto: 675,
    descripcion: 'Vista de mesas de Restaurant Sumaqta',
    puntos: [
      { x: 50, y: 7, titulo: 'Todo el restaurante en cuatro pestañas', texto: 'Punto de venta, mesas, pedidos e historial sin salir de la misma pantalla.' },
      { x: 6.5, y: 44, titulo: 'Mesa ocupada', texto: 'Muestra cuánto tiempo lleva, cuántos platos y cuánto va la cuenta.' },
      { x: 17, y: 67, titulo: 'Mesa libre', texto: 'En verde las mesas disponibles para recibir clientes.' },
      { x: 37, y: 16, titulo: 'Filtros del salón', texto: 'Muestra solo las mesas disponibles, ocupadas o fuera de servicio.' },
      { x: 87, y: 50, titulo: 'Abrir una mesa', texto: 'Registra personas, cliente y el mozo que la atiende.' },
    ],
  },
  'agente-amantix': {
    imagen: '/productos/agente/agente-hero.png',
    ancho: 1024,
    alto: 450,
    descripcion: 'Inicio de Agente Amantix',
    puntos: [
      { x: 30, y: 30, titulo: 'Comisiones de hoy', texto: 'Lo que ganaste hoy y en el mes, sin sacar cuentas a mano.' },
      { x: 50, y: 30, titulo: 'Monto movido', texto: 'Cuánto dinero pasó por tu agente en el día.' },
      { x: 68, y: 30, titulo: 'Estado de caja', texto: 'Te avisa si la caja está abierta o cerrada.' },
      { x: 88, y: 30, titulo: 'Comprobantes SUNAT', texto: 'Boletas aceptadas y pendientes de envío.' },
      { x: 79, y: 54, titulo: 'Meta de comisiones', texto: 'Define tu meta del mes y mira cuánto te falta.' },
      { x: 26, y: 86, titulo: 'Operaciones por día', texto: 'Las últimas dos semanas para detectar tus días fuertes.' },
    ],
  },
};
