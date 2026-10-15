export interface Barra {
  readonly etiqueta: string;
  readonly valor: number;
}

export interface SemanaVentas {
  readonly nombre: string;
  readonly dias: readonly Barra[];
}

export type EstadoMesa = 'libre' | 'ocupada' | 'por-cobrar';

export interface Mesa {
  readonly numero: number;
  readonly estado: EstadoMesa;
  readonly personas: number;
  readonly pedido: readonly { readonly plato: string; readonly cantidad: number; readonly precio: number }[];
}

export interface DiaCaja {
  readonly dia: string;
  readonly billeteras: readonly Barra[];
  readonly comisiones: number;
}

export const SEMANAS_VENTAS: readonly SemanaVentas[] = [
  {
    nombre: 'Semana 1',
    dias: [
      { etiqueta: 'Lun', valor: 1240 },
      { etiqueta: 'Mar', valor: 980 },
      { etiqueta: 'Mié', valor: 1415 },
      { etiqueta: 'Jue', valor: 1302 },
      { etiqueta: 'Vie', valor: 1890 },
      { etiqueta: 'Sáb', valor: 2310 },
      { etiqueta: 'Dom', valor: 1120 },
    ],
  },
  {
    nombre: 'Semana 2',
    dias: [
      { etiqueta: 'Lun', valor: 1105 },
      { etiqueta: 'Mar', valor: 1260 },
      { etiqueta: 'Mié', valor: 1180 },
      { etiqueta: 'Jue', valor: 1540 },
      { etiqueta: 'Vie', valor: 2045 },
      { etiqueta: 'Sáb', valor: 2480 },
      { etiqueta: 'Dom', valor: 1360 },
    ],
  },
  {
    nombre: 'Semana 3',
    dias: [
      { etiqueta: 'Lun', valor: 1320 },
      { etiqueta: 'Mar', valor: 1410 },
      { etiqueta: 'Mié', valor: 1290 },
      { etiqueta: 'Jue', valor: 1675 },
      { etiqueta: 'Vie', valor: 2210 },
      { etiqueta: 'Sáb', valor: 2655 },
      { etiqueta: 'Dom', valor: 1480 },
    ],
  },
];

export const COMPROBANTES: readonly Barra[] = [
  { etiqueta: 'Boletas', valor: 186 },
  { etiqueta: 'Facturas', valor: 74 },
  { etiqueta: 'Guías de remisión', valor: 21 },
  { etiqueta: 'Notas de crédito', valor: 6 },
];

const CARTA = {
  lomo: { plato: 'Lomo saltado', precio: 28 },
  ceviche: { plato: 'Ceviche', precio: 32 },
  pollo: { plato: '1/4 de pollo a la brasa', precio: 19 },
  juane: { plato: 'Juane', precio: 18 },
  chicha: { plato: 'Jarra de chicha', precio: 15 },
  cafe: { plato: 'Café', precio: 6 },
};

export const MESAS: readonly Mesa[] = [
  { numero: 1, estado: 'ocupada', personas: 4, pedido: [{ ...CARTA.lomo, cantidad: 2 }, { ...CARTA.ceviche, cantidad: 2 }, { ...CARTA.chicha, cantidad: 1 }] },
  { numero: 2, estado: 'libre', personas: 0, pedido: [] },
  { numero: 3, estado: 'por-cobrar', personas: 2, pedido: [{ ...CARTA.juane, cantidad: 2 }, { ...CARTA.cafe, cantidad: 2 }] },
  { numero: 4, estado: 'ocupada', personas: 3, pedido: [{ ...CARTA.pollo, cantidad: 3 }, { ...CARTA.chicha, cantidad: 1 }] },
  { numero: 5, estado: 'libre', personas: 0, pedido: [] },
  { numero: 6, estado: 'ocupada', personas: 6, pedido: [{ ...CARTA.ceviche, cantidad: 3 }, { ...CARTA.lomo, cantidad: 3 }, { ...CARTA.chicha, cantidad: 2 }] },
  { numero: 7, estado: 'libre', personas: 0, pedido: [] },
  { numero: 8, estado: 'por-cobrar', personas: 2, pedido: [{ ...CARTA.lomo, cantidad: 1 }, { ...CARTA.pollo, cantidad: 1 }] },
  { numero: 9, estado: 'ocupada', personas: 2, pedido: [{ ...CARTA.juane, cantidad: 1 }, { ...CARTA.ceviche, cantidad: 1 }] },
  { numero: 10, estado: 'libre', personas: 0, pedido: [] },
  { numero: 11, estado: 'libre', personas: 0, pedido: [] },
  { numero: 12, estado: 'ocupada', personas: 5, pedido: [{ ...CARTA.pollo, cantidad: 4 }, { ...CARTA.chicha, cantidad: 2 }] },
];

export const PLATOS_VENDIDOS: readonly Barra[] = [
  { etiqueta: 'Lomo saltado', valor: 42 },
  { etiqueta: 'Ceviche', valor: 37 },
  { etiqueta: '1/4 de pollo a la brasa', valor: 33 },
  { etiqueta: 'Juane', valor: 21 },
  { etiqueta: 'Jarra de chicha', valor: 18 },
];

export const DIAS_CAJA: readonly DiaCaja[] = [
  {
    dia: 'Lunes',
    comisiones: 186,
    billeteras: [
      { etiqueta: 'BCP', valor: 8420 },
      { etiqueta: 'BBVA', valor: 5310 },
      { etiqueta: 'Interbank', valor: 3980 },
      { etiqueta: 'Yape', valor: 6240 },
      { etiqueta: 'Plin', valor: 2150 },
      { etiqueta: 'Efectivo', valor: 7600 },
    ],
  },
  {
    dia: 'Martes',
    comisiones: 164,
    billeteras: [
      { etiqueta: 'BCP', valor: 7380 },
      { etiqueta: 'BBVA', valor: 4920 },
      { etiqueta: 'Interbank', valor: 4410 },
      { etiqueta: 'Yape', valor: 5870 },
      { etiqueta: 'Plin', valor: 1980 },
      { etiqueta: 'Efectivo', valor: 6950 },
    ],
  },
  {
    dia: 'Miércoles',
    comisiones: 201,
    billeteras: [
      { etiqueta: 'BCP', valor: 9150 },
      { etiqueta: 'BBVA', valor: 5760 },
      { etiqueta: 'Interbank', valor: 4120 },
      { etiqueta: 'Yape', valor: 7030 },
      { etiqueta: 'Plin', valor: 2460 },
      { etiqueta: 'Efectivo', valor: 8120 },
    ],
  },
  {
    dia: 'Sábado',
    comisiones: 248,
    billeteras: [
      { etiqueta: 'BCP', valor: 11240 },
      { etiqueta: 'BBVA', valor: 6890 },
      { etiqueta: 'Interbank', valor: 5230 },
      { etiqueta: 'Yape', valor: 9480 },
      { etiqueta: 'Plin', valor: 3120 },
      { etiqueta: 'Efectivo', valor: 10350 },
    ],
  },
];
