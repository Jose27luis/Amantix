export type Rol = 'administrador' | 'cliente';

export type EstadoLead = 'nuevo' | 'contactado' | 'demo' | 'propuesta' | 'ganado' | 'perdido';

export type OrigenLead = 'contacto' | 'demo' | 'cotizacion';

export type EstadoSuscripcion = 'activa' | 'suspendida' | 'baja';

export type Periodo = 'mensual' | 'anual';

export type PrioridadTicket = 'baja' | 'media' | 'alta';

export type EstadoTicket = 'abierto' | 'en_atencion' | 'esperando' | 'resuelto' | 'cerrado';

export interface Usuario {
  readonly id: number;
  readonly nombre: string;
  readonly correo: string;
  readonly rol: Rol;
  readonly empresa: { readonly id: number; readonly razon_social: string } | null;
  readonly activo: boolean;
  readonly debe_cambiar_password: boolean;
  readonly ultimo_ingreso: string | null;
  readonly creado: string | null;
}

export interface RespuestaLogin {
  readonly token: string;
  readonly usuario: Usuario;
}

export interface ProductoResumen {
  readonly id: number;
  readonly slug: string;
  readonly codigo: string;
  readonly nombre: string;
}

export interface Lead {
  readonly id: number;
  readonly codigo: string;
  readonly nombre: string;
  readonly empresa: string | null;
  readonly correo: string;
  readonly telefono: string | null;
  readonly mensaje: string;
  readonly origen: OrigenLead;
  readonly estado: EstadoLead;
  readonly motivo_perdida: string | null;
  readonly producto: ProductoResumen | null;
  readonly asignado: { readonly id: number; readonly nombre: string } | null;
  readonly empresa_cliente_id: number | null;
  readonly creado: string;
  readonly actualizado: string;
}

export interface NotaLead {
  readonly id: number;
  readonly nota: string;
  readonly autor: string | null;
  readonly creado: string;
}

export interface RegistroHistorial {
  readonly id: number;
  readonly accion: string;
  readonly detalle: Readonly<Record<string, string | number | string[] | null>> | null;
  readonly autor: string | null;
  readonly creado: string;
}

export interface DetalleLead {
  readonly lead: Lead;
  readonly notas: readonly NotaLead[];
  readonly historial: readonly RegistroHistorial[];
}

export interface Paginado<T> {
  readonly data: readonly T[];
  readonly meta: {
    readonly current_page: number;
    readonly last_page: number;
    readonly per_page: number;
    readonly total: number;
    readonly from: number | null;
    readonly to: number | null;
  };
}

export interface ListaSimple<T> {
  readonly data: readonly T[];
}

export interface FiltrosLead {
  readonly buscar: string;
  readonly estado: EstadoLead | '';
  readonly origen: OrigenLead | '';
  readonly producto_id: string;
  readonly desde: string;
  readonly hasta: string;
  readonly page: number;
}

export interface CambioLead {
  readonly estado?: EstadoLead;
  readonly motivo_perdida?: string | null;
  readonly asignado_a?: number | null;
}

export interface FilaConteo {
  readonly etiqueta: string;
  readonly total: number;
}

export interface MetricasLeads {
  readonly periodo: { readonly desde: string; readonly hasta: string };
  readonly indicadores: {
    readonly leads: number;
    readonly leads_periodo_anterior: number;
    readonly ganados: number;
    readonly perdidos: number;
    readonly conversion: number;
    readonly sin_atender: number;
  };
  readonly por_semana: readonly { readonly semana: string; readonly total: number }[];
  readonly por_producto: readonly { readonly producto: string; readonly total: number }[];
  readonly por_origen: readonly { readonly origen: OrigenLead; readonly total: number }[];
  readonly embudo: readonly { readonly estado: EstadoLead; readonly total: number }[];
}

export interface MetricasClientes {
  readonly activos: number;
  readonly suscripciones_activas: number;
  readonly ingreso_mensual: number;
  readonly altas: number;
  readonly bajas: number;
  readonly renovaciones_proximas: number;
  readonly empresas: number;
  readonly ingreso_por_producto: readonly { readonly producto: string; readonly monto: number }[];
}

export interface MetricasSoporte {
  readonly abiertos: number;
  readonly sin_responder: number;
  readonly creados: number;
  readonly primera_respuesta_minutos: number | null;
  readonly por_estado: readonly { readonly estado: EstadoTicket; readonly total: number }[];
}

export interface Dashboard {
  readonly leads: MetricasLeads;
  readonly clientes: MetricasClientes;
  readonly soporte: MetricasSoporte;
}

export interface Plan {
  readonly id: number;
  readonly nombre: string;
  readonly precio: number;
  readonly periodo: Periodo;
  readonly descripcion: string;
  readonly caracteristicas: readonly string[];
  readonly destacado: boolean;
}

export interface Empresa {
  readonly id: number;
  readonly razon_social: string;
  readonly ruc: string;
  readonly rubro: string | null;
  readonly direccion: string | null;
  readonly contacto: string | null;
  readonly telefono: string | null;
  readonly correo: string | null;
  readonly suscripciones_activas: number | null;
  readonly tickets_abiertos: number | null;
  readonly proxima_renovacion: string | null;
  readonly creado: string | null;
}

export interface DatosEmpresa {
  readonly razon_social: string;
  readonly ruc: string;
  readonly rubro: string | null;
  readonly direccion: string | null;
  readonly contacto: string | null;
  readonly telefono: string | null;
  readonly correo: string | null;
}

export interface Suscripcion {
  readonly id: number;
  readonly empresa_id: number;
  readonly producto: { readonly id: number; readonly nombre: string; readonly url_produccion: string } | null;
  readonly plan: { readonly id: number; readonly nombre: string } | null;
  readonly precio: number;
  readonly concepto: string | null;
  readonly cuenta_externa: string | null;
  readonly periodo: Periodo;
  readonly fecha_alta: string;
  readonly proxima_renovacion: string;
  readonly estado: EstadoSuscripcion;
}

export interface NuevaSuscripcion {
  readonly producto_id: number;
  readonly plan_id: number;
  readonly precio: number;
  readonly concepto?: string;
  readonly periodo: Periodo;
  readonly fecha_alta: string;
  readonly proxima_renovacion?: string;
}

export interface CambioSuscripcion {
  readonly plan_id?: number;
  readonly precio?: number;
  readonly concepto?: string | null;
  readonly periodo?: Periodo;
  readonly proxima_renovacion?: string;
  readonly estado?: EstadoSuscripcion;
}

export type EstadoCuenta = 'pendiente' | 'en_revision' | 'pagada' | 'anulada';
export type EstadoPago = 'en_revision' | 'aceptado' | 'rechazado';
export type MetodoPago = 'yape' | 'plin' | 'transferencia' | 'deposito' | 'efectivo' | 'otro';
export type FiltroCuenta = EstadoCuenta | 'por_cobrar' | 'vencidas';

export interface PagoReportado {
  readonly id: number;
  readonly cuenta_id: number;
  readonly monto: number;
  readonly metodo: MetodoPago;
  readonly metodo_nombre: string | null;
  readonly numero_operacion: string | null;
  readonly fecha_pago: string;
  readonly tiene_captura: boolean;
  readonly captura_es_imagen: boolean;
  readonly origen: string;
  readonly estado: EstadoPago;
  readonly motivo_rechazo: string | null;
  readonly reportado_por: string | null;
  readonly revisado_por: string | null;
  readonly revisado_at: string | null;
  readonly creado_at: string;
  readonly cuenta: CuentaCobrar | null;
}

export interface ComprobanteCobranza {
  readonly tipo: string;
  readonly numero: string | null;
  readonly estado: 'pendiente' | 'emitido' | 'error';
  readonly estado_sunat: string | null;
  readonly pdf_url: string | null;
  readonly error: string | null;
}

export interface CuentaCobrar {
  readonly id: number;
  readonly empresa: { readonly id: number; readonly razon_social: string; readonly ruc: string; readonly telefono: string | null } | null;
  readonly producto: string | null;
  readonly concepto: string;
  readonly periodo_inicio: string | null;
  readonly periodo_fin: string | null;
  readonly monto: number;
  readonly vence: string;
  readonly vencida: boolean;
  readonly estado: EstadoCuenta;
  readonly origen: string;
  readonly pagada_at: string | null;
  readonly motivo_anulacion: string | null;
  readonly pagos: readonly PagoReportado[];
  readonly comprobante: ComprobanteCobranza | null;
}

export interface ResumenCobranza {
  readonly por_cobrar: number;
  readonly cuentas_por_cobrar: number;
  readonly vencidas: number;
  readonly monto_vencido: number;
  readonly pagos_en_revision: number;
  readonly cobrado_mes: number;
}

export interface MetodoPagoCuenta {
  readonly id: number;
  readonly nombre: string;
  readonly tipo: MetodoPago;
  readonly titular: string | null;
  readonly numero: string | null;
  readonly cci: string | null;
  readonly instrucciones: string | null;
  readonly activo: boolean;
  readonly orden: number;
}

export interface DatosMetodoPago {
  readonly nombre: string;
  readonly tipo: MetodoPago;
  readonly titular: string | null;
  readonly numero: string | null;
  readonly cci: string | null;
  readonly instrucciones: string | null;
  readonly activo: boolean;
  readonly orden: number;
}

export interface CobranzaCliente {
  readonly por_pagar: readonly CuentaCobrar[];
  readonly pagadas: readonly CuentaCobrar[];
  readonly metodos_pago: readonly MetodoPagoCuenta[];
}

export interface CambioCuenta {
  readonly concepto: string;
  readonly monto: number;
  readonly vence: string;
}

export interface DatosPago {
  readonly metodo_pago_id: string;
  readonly metodo: MetodoPago;
  readonly numero_operacion: string;
  readonly fecha_pago: string;
  readonly monto: string;
}

export interface NuevaCuenta {
  readonly empresa_id: number;
  readonly concepto: string;
  readonly monto: number;
  readonly vence: string;
}

export interface Ticket {
  readonly id: number;
  readonly codigo: string;
  readonly asunto: string;
  readonly prioridad: PrioridadTicket;
  readonly estado: EstadoTicket;
  readonly pendiente_respuesta: boolean;
  readonly puede_reabrirse: boolean;
  readonly empresa: { readonly id: number; readonly razon_social: string } | null;
  readonly producto: { readonly id: number; readonly nombre: string } | null;
  readonly asignado: { readonly id: number; readonly nombre: string } | null;
  readonly primera_respuesta: string | null;
  readonly resuelto_en: string | null;
  readonly creado: string;
  readonly actualizado: string;
}

export interface DetalleEmpresa {
  readonly empresa: Empresa;
  readonly suscripciones: readonly Suscripcion[];
  readonly usuarios: readonly Usuario[];
  readonly tickets: readonly Ticket[];
}

export interface Adjunto {
  readonly id: number;
  readonly nombre: string;
  readonly tipo: string;
  readonly tamano: number;
}

export interface MensajeTicket {
  readonly id: number;
  readonly mensaje: string;
  readonly interno: boolean;
  readonly autor: { readonly nombre: string; readonly es_equipo: boolean } | null;
  readonly adjuntos: readonly Adjunto[];
  readonly creado: string;
}

export interface DetalleTicket {
  readonly ticket: Ticket;
  readonly mensajes: readonly MensajeTicket[];
  readonly historial: readonly RegistroHistorial[];
}

export interface FiltrosTicket {
  readonly buscar: string;
  readonly estado: EstadoTicket | 'activos' | '';
  readonly prioridad: PrioridadTicket | '';
  readonly producto_id: string;
  readonly empresa_id: string;
  readonly sin_responder: boolean;
  readonly page: number;
}

export interface CambioTicket {
  readonly estado?: EstadoTicket;
  readonly prioridad?: PrioridadTicket;
  readonly asignado_a?: number | null;
}

export interface ResumenCliente {
  readonly empresa: Empresa;
  readonly suscripciones: readonly Suscripcion[];
  readonly tickets_abiertos: number;
  readonly tickets_recientes: readonly Ticket[];
}

export interface ConversionLead {
  readonly razon_social: string;
  readonly ruc: string;
  readonly rubro: string | null;
  readonly producto_id: number;
  readonly plan_id: number;
  readonly precio: number;
  readonly fecha_alta: string;
}

export interface ResultadoConversion {
  readonly empresa: Empresa;
  readonly correo: string;
  readonly password_temporal: string;
}

export interface UsuarioCreado {
  readonly usuario: Usuario;
  readonly password_temporal: string;
}

export interface ErrorApi {
  readonly message: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}
