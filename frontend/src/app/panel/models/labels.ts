import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi, EstadoLead, OrigenLead } from './panel.models';

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
