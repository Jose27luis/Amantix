import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi, EstadoLead, EstadoSuscripcion, EstadoTicket, OrigenLead, PrioridadTicket } from './panel.models';

export const ESTADOS_TICKET: readonly { readonly valor: EstadoTicket; readonly etiqueta: string }[] = [
  { valor: 'abierto', etiqueta: 'Abierto' },
  { valor: 'en_atencion', etiqueta: 'En atención' },
  { valor: 'esperando', etiqueta: 'Esperando al cliente' },
  { valor: 'resuelto', etiqueta: 'Resuelto' },
  { valor: 'cerrado', etiqueta: 'Cerrado' },
];

export const PRIORIDADES_TICKET: readonly { readonly valor: PrioridadTicket; readonly etiqueta: string }[] = [
  { valor: 'baja', etiqueta: 'Baja' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'alta', etiqueta: 'Alta' },
];

export const ESTADOS_SUSCRIPCION: readonly { readonly valor: EstadoSuscripcion; readonly etiqueta: string }[] = [
  { valor: 'activa', etiqueta: 'Activa' },
  { valor: 'suspendida', etiqueta: 'Suspendida' },
  { valor: 'baja', etiqueta: 'De baja' },
];

export function etiquetaEstadoTicket(estado: EstadoTicket): string {
  return ESTADOS_TICKET.find((item) => item.valor === estado)?.etiqueta ?? estado;
}

export function etiquetaPrioridad(prioridad: PrioridadTicket): string {
  return PRIORIDADES_TICKET.find((item) => item.valor === prioridad)?.etiqueta ?? prioridad;
}

export function etiquetaEstadoSuscripcion(estado: EstadoSuscripcion): string {
  return ESTADOS_SUSCRIPCION.find((item) => item.valor === estado)?.etiqueta ?? estado;
}

export function formatoSoles(monto: number): string {
  return `S/ ${monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatoTamano(bytes: number): string {
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatoMinutos(minutos: number | null): string {
  if (minutos === null) {
    return 'Sin datos';
  }
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  return horas < 48 ? `${horas} h ${minutos % 60} min` : `${Math.round(horas / 24)} días`;
}

export function fechaHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function fechaCorta(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  const [anio, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

export const ESTADOS_LEAD: readonly { readonly valor: EstadoLead; readonly etiqueta: string }[] = [
  { valor: 'nuevo', etiqueta: 'Nuevo' },
  { valor: 'contactado', etiqueta: 'Contactado' },
  { valor: 'demo', etiqueta: 'Demo agendada' },
  { valor: 'propuesta', etiqueta: 'Propuesta enviada' },
  { valor: 'ganado', etiqueta: 'Ganado' },
  { valor: 'perdido', etiqueta: 'Perdido' },
];

export const ORIGENES_LEAD: readonly { readonly valor: OrigenLead; readonly etiqueta: string }[] = [
  { valor: 'contacto', etiqueta: 'Contacto' },
  { valor: 'demo', etiqueta: 'Demo' },
  { valor: 'cotizacion', etiqueta: 'Cotización' },
];

const ACCIONES: Readonly<Record<string, string>> = {
  lead_recibido: 'Lead recibido desde el sitio',
  lead_estado: 'Cambio de estado',
  lead_asignado: 'Cambio de responsable',
  lead_convertido: 'Convertido en cliente',
  ticket_abierto: 'Ticket abierto',
  ticket_estado: 'Cambio de estado',
  ticket_asignado: 'Cambio de responsable',
  ticket_reabierto: 'Reabierto por el cliente',
};

export function etiquetaEstado(estado: EstadoLead): string {
  return ESTADOS_LEAD.find((item) => item.valor === estado)?.etiqueta ?? estado;
}

export function etiquetaOrigen(origen: OrigenLead): string {
  return ORIGENES_LEAD.find((item) => item.valor === origen)?.etiqueta ?? origen;
}

export function etiquetaAccion(accion: string): string {
  return ACCIONES[accion] ?? accion;
}

export function mensajeError(error: HttpErrorResponse, alternativo: string): string {
  if (error.status === 0) {
    return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  }

  const cuerpo = error.error as ErrorApi | null;
  const primero = cuerpo?.errors ? Object.values(cuerpo.errors)[0]?.[0] : undefined;

  return primero ?? cuerpo?.message ?? alternativo;
}

export function enlaceWhatsapp(telefono: string | null): string | null {
  if (!telefono) {
    return null;
  }

  const digitos = telefono.replace(/\D/g, '');

  if (digitos.length === 9 && digitos.startsWith('9')) {
    return `https://wa.me/51${digitos}`;
  }

  return digitos.length >= 10 ? `https://wa.me/${digitos}` : null;
}
