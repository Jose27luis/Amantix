export type Rol = 'administrador' | 'cliente';

export type EstadoLead = 'nuevo' | 'contactado' | 'demo' | 'propuesta' | 'ganado' | 'perdido';

export type OrigenLead = 'contacto' | 'demo' | 'cotizacion';

export interface Usuario {
  readonly id: number;
  readonly nombre: string;
  readonly correo: string;
  readonly rol: Rol;
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

export interface Dashboard {
  readonly leads: MetricasLeads;
}

export interface UsuarioCreado {
  readonly usuario: Usuario;
  readonly password_temporal: string;
}

export interface ErrorApi {
  readonly message: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}
