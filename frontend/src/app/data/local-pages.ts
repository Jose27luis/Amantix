import { PreguntaFrecuente } from '../models/product.model';
import { TipoIlustracion } from '../components/rubro-illustration/rubro-illustration.component';

export interface Beneficio {
  readonly titulo: string;
  readonly descripcion: string;
}

export interface PaginaLocal {
  readonly slug: string;
  readonly producto: string;
  readonly servicio: string;
  readonly lugar: string;
  readonly tituloSeo: string;
  readonly descripcionSeo: string;
  readonly titulo: string;
  readonly bajada: string;
  readonly introduccion: readonly string[];
  readonly beneficios: readonly Beneficio[];
  readonly rubros: readonly string[];
  readonly pasos: readonly Beneficio[];
  readonly faqs: readonly PreguntaFrecuente[];
  readonly imagen: string;
  readonly ilustracion: TipoIlustracion;
}

const PASOS_COMUNES: readonly Beneficio[] = [
  { titulo: 'Demo gratuita', descripcion: 'Te mostramos el sistema con ejemplos de tu negocio, por videollamada o en persona en Puerto Maldonado.' },
  { titulo: 'Configuración', descripcion: 'Cargamos tu empresa, productos, series y usuarios contigo. No tienes que hacerlo solo.' },
  { titulo: 'Capacitación', descripcion: 'Enseñamos a tu equipo a usarlo en su trabajo diario, con tus propios datos.' },
  { titulo: 'Acompañamiento', descripcion: 'Seguimos contigo por WhatsApp para resolver dudas y ajustar lo que haga falta.' },
];

export const PAGINAS_LOCALES: readonly PaginaLocal[] = [
  {
    slug: 'facturacion-electronica-puerto-maldonado',
    producto: 'facturador-amantix',
    servicio: 'Facturación electrónica',
    lugar: 'Puerto Maldonado',
    tituloSeo: 'Facturación electrónica en Puerto Maldonado',
    descripcionSeo:
      'Sistema de facturación electrónica válido ante SUNAT para negocios de Puerto Maldonado: facturas, boletas, guías, inventario y punto de venta, con soporte local.',
    titulo: 'Facturación electrónica en Puerto Maldonado',
    bajada: 'Emite facturas, boletas y guías válidas ante SUNAT desde tu computadora o tu celular, con soporte de un equipo que está en Madre de Dios.',
    introduccion: [
      'Facturador Amantix es el sistema de facturación electrónica que desarrollamos en Puerto Maldonado para bodegas, ferreterías, distribuidoras, hoteles y cualquier negocio que necesite emitir comprobantes a SUNAT sin complicarse.',
      'Además de facturar, controlas tu inventario, vendes desde el punto de venta, revisas tus reportes y le das acceso a tu contador. Todo en un solo sistema y con tu información separada de la de otras empresas.',
    ],
    beneficios: [
      { titulo: 'Válido ante SUNAT', descripcion: 'Facturas, boletas, notas de crédito y débito y guías de remisión electrónicas, con el estado de cada comprobante a la vista.' },
      { titulo: 'Inventario y punto de venta', descripcion: 'Almacenes, listas de precios y venta rápida en mostrador, con cambio de moneda.' },
      { titulo: 'SIRE y panel del contador', descripcion: 'Registro de compras y ventas desde SUNAT y un acceso para que tu contador revise todo.' },
      { titulo: 'Soporte en tu ciudad', descripcion: 'Te atendemos por WhatsApp y, si hace falta, en persona en Puerto Maldonado.' },
    ],
    rubros: ['Bodegas y minimarkets', 'Ferreterías', 'Distribuidoras', 'Hoteles y hospedajes', 'Tiendas de ropa', 'Estudios contables'],
    pasos: PASOS_COMUNES,
    faqs: [
      {
        pregunta: '¿Necesito estar en Puerto Maldonado para usar el sistema?',
        respuesta: 'No. Funciona por internet desde cualquier lugar del Perú. Estar en Puerto Maldonado solo te permite pedir soporte en persona.',
      },
      {
        pregunta: '¿Qué necesito para empezar a facturar electrónicamente?',
        respuesta: 'Tu RUC activo y tu Clave SOL. Con eso configuramos tu empresa, tus series y tu certificado digital.',
      },
      {
        pregunta: '¿Puedo emitir comprobantes desde el celular?',
        respuesta: 'Sí. El sistema funciona desde el navegador de la computadora, la tablet o el celular.',
      },
      {
        pregunta: '¿Cuánto cuesta el sistema de facturación?',
        respuesta: 'Los planes empiezan en S/ 80 al mes e incluyen soporte por WhatsApp.',
      },
    ],
    imagen: '/productos/prod-facturador.png',
    ilustracion: 'facturacion',
  },
  {
    slug: 'sistema-restaurantes-madre-de-dios',
    producto: 'restaurant-sumaqta',
    servicio: 'Sistema para restaurantes',
    lugar: 'Madre de Dios',
    tituloSeo: 'Sistema para restaurantes en Madre de Dios',
    descripcionSeo:
      'Restaurant Sumaqta: comandas desde el celular del mozo, impresión en cocina, mesas, división de cuentas, delivery y boletas electrónicas para restaurantes de Madre de Dios.',
    titulo: 'Sistema para restaurantes en Madre de Dios',
    bajada: 'Tus mozos toman los pedidos desde el celular, la cocina recibe la comanda al instante y cobras con boleta o factura electrónica.',
    introduccion: [
      'Restaurant Sumaqta es el sistema que hicimos para restaurantes, pollerías, cevicherías y cafeterías de Puerto Maldonado y todo Madre de Dios. Ordena el salón, la cocina y la caja en un solo lugar.',
      'El mozo registra el pedido en su celular, la comanda se imprime en cocina y, al cerrar la cuenta, emites el comprobante electrónico. También controlas tus insumos y tus ventas para llevar y delivery.',
    ],
    beneficios: [
      { titulo: 'Comandas desde el celular', descripcion: 'El mozo arma el pedido por mesa y la cocina lo recibe sin papelitos ni gritos.' },
      { titulo: 'Mesas y división de cuentas', descripcion: 'Ves qué mesas están ocupadas y repartes la cuenta entre varios comensales.' },
      { titulo: 'Boleta o factura al cobrar', descripcion: 'El comprobante electrónico sale en el momento, conectado a SUNAT.' },
      { titulo: 'Insumos y delivery', descripcion: 'Stock de insumos con costo y merma, y ventas para llevar separadas del salón.' },
    ],
    rubros: ['Restaurantes', 'Pollerías', 'Cevicherías', 'Cafeterías', 'Chifas', 'Juguerías'],
    pasos: PASOS_COMUNES,
    faqs: [
      {
        pregunta: '¿Qué equipos necesito para usar el sistema en mi restaurante?',
        respuesta: 'Una computadora en caja con una impresora térmica para las comandas y los celulares de tus mozos.',
      },
      {
        pregunta: '¿Funciona para restaurantes de Puerto Maldonado y de otras ciudades de Madre de Dios?',
        respuesta: 'Sí. Funciona por internet en cualquier local de Madre de Dios y del Perú.',
      },
      {
        pregunta: '¿Puedo dividir la cuenta de una mesa?',
        respuesta: 'Sí. Repartes los productos entre los comensales y cobras o facturas a cada uno por separado.',
      },
      {
        pregunta: '¿Emite boletas y facturas electrónicas?',
        respuesta: 'Sí. Al cerrar la cuenta eliges boleta o factura y el comprobante se envía a SUNAT.',
      },
    ],
    imagen: '/productos/prod-restaurante.png',
    ilustracion: 'restaurante',
  },
  {
    slug: 'sistema-agentes-bancarios-puerto-maldonado',
    producto: 'agente-amantix',
    servicio: 'Sistema para agentes bancarios',
    lugar: 'Puerto Maldonado',
    tituloSeo: 'Sistema para agentes bancarios en Puerto Maldonado',
    descripcionSeo:
      'Agente Amantix: controla las billeteras de tu agente multibancario (BCP, BBVA, Interbank, Yape, Plin), comisiones, préstamos y cierre de caja diario. Hecho en Puerto Maldonado.',
    titulo: 'Sistema para agentes bancarios en Puerto Maldonado',
    bajada: 'Registra cada depósito, retiro y giro contra la billetera correcta, calcula tus comisiones y cuadra tu caja todos los días.',
    introduccion: [
      'Agente Amantix es la plataforma que creamos para agentes multibancarios de Puerto Maldonado. Reemplaza el cuaderno y la hoja de cálculo por un registro ordenado de cada operación.',
      'Cada cajero registra ingresos y salidas contra BCP, BBVA, Interbank, Yape, Plin, Tunki, Western Union o efectivo. Al final del día, el reporte te dice cuánto debe haber en cada billetera.',
    ],
    beneficios: [
      { titulo: 'Caja por billetera', descripcion: 'El saldo de cada banco, billetera digital y efectivo, siempre al día.' },
      { titulo: 'Comisiones automáticas', descripcion: 'Cada operación guarda su comisión y el reporte las suma por billetera.' },
      { titulo: 'Préstamos y boletas', descripcion: 'Otorgas préstamos y emites boletas SUNAT desde la misma operación.' },
      { titulo: 'Cierre diario', descripcion: 'Cuadras la caja antes de cerrar y detectas diferencias el mismo día.' },
    ],
    rubros: ['Agentes multibancarios', 'Agentes BCP', 'Agentes BBVA', 'Agentes Interbank', 'Casas de giros', 'Bodegas con agente'],
    pasos: PASOS_COMUNES,
    faqs: [
      {
        pregunta: '¿Con qué bancos y billeteras funciona Agente Amantix?',
        respuesta: 'Con BCP, BBVA, Interbank, Yape, Plin, Tunki, Western Union y efectivo, y puedes agregar otras fuentes de fondos.',
      },
      {
        pregunta: '¿Pueden trabajar varios cajeros a la vez?',
        respuesta: 'Sí. Cada cajero tiene su usuario y registra sus operaciones; tú ves el resumen de todos.',
      },
      {
        pregunta: '¿Cómo cuadro la caja al final del día?',
        respuesta: 'El cierre diario muestra el saldo esperado de cada billetera y el resumen por tipo de operación.',
      },
      {
        pregunta: '¿Mi información está separada de la de otros agentes?',
        respuesta: 'Sí. Cada empresa trabaja con su propia base de datos aislada.',
      },
    ],
    imagen: '/productos/prod-agente.png',
    ilustracion: 'agente',
  },
  {
    slug: 'sistema-farmacias-boticas-madre-de-dios',
    producto: 'facturador-amantix',
    servicio: 'Sistema para farmacias y boticas',
    lugar: 'Madre de Dios',
    tituloSeo: 'Sistema para farmacias y boticas en Madre de Dios',
    descripcionSeo:
      'Sistema para farmacias y boticas de Madre de Dios: venta con boleta y factura electrónica, control de lotes y vencimientos, inventario y reportes. Soporte en Puerto Maldonado.',
    titulo: 'Sistema para farmacias y boticas en Madre de Dios',
    bajada: 'Vende con boleta o factura electrónica, controla tus lotes y vencimientos y sabe qué medicamentos reponer.',
    introduccion: [
      'Facturador Amantix tiene un modo para farmacias y boticas pensado para el día a día del mostrador en Puerto Maldonado y Madre de Dios: vender rápido, emitir el comprobante y no perder mercadería por vencimiento.',
      'Cada venta descuenta el lote correcto y tú ves qué productos se están por vencer y cuáles necesitas reponer, con reportes para ti y para tu contador.',
    ],
    beneficios: [
      { titulo: 'Lotes y vencimientos', descripcion: 'Cada producto con su lote y fecha de vencimiento, y la venta toma el lote que corresponde.' },
      { titulo: 'Venta rápida en mostrador', descripcion: 'Punto de venta con búsqueda de productos y boleta o factura en segundos.' },
      { titulo: 'Inventario al día', descripcion: 'Stock por almacén y reportes para saber qué reponer.' },
      { titulo: 'Válido ante SUNAT', descripcion: 'Comprobantes electrónicos enviados a SUNAT y acceso para tu contador.' },
    ],
    rubros: ['Farmacias', 'Boticas', 'Droguerías', 'Cadenas de boticas', 'Farmacias de clínicas', 'Veterinarias'],
    pasos: PASOS_COMUNES,
    faqs: [
      {
        pregunta: '¿El sistema controla lotes y fechas de vencimiento?',
        respuesta: 'Sí. Registras el lote y el vencimiento de cada ingreso y la venta descuenta del lote correspondiente.',
      },
      {
        pregunta: '¿Puedo emitir boletas y facturas en la farmacia?',
        respuesta: 'Sí. Emites boletas y facturas electrónicas válidas ante SUNAT desde el punto de venta.',
      },
      {
        pregunta: '¿Sirve para boticas de Puerto Maldonado y de provincias de Madre de Dios?',
        respuesta: 'Sí. Funciona por internet en cualquier local y te damos soporte desde Puerto Maldonado.',
      },
      {
        pregunta: '¿Cuánto cuesta?',
        respuesta: 'Los planes empiezan en S/ 80 al mes e incluyen soporte por WhatsApp.',
      },
    ],
    imagen: '/productos/prod-facturador.png',
    ilustracion: 'farmacia',
  },
];
