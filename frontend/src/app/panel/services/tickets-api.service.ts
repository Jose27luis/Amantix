import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  Adjunto,
  CambioTicket,
  DetalleTicket,
  FiltrosTicket,
  MensajeTicket,
  Paginado,
  PrioridadTicket,
  ResumenCliente,
  Ticket,
} from '../models/panel.models';

export interface NuevoTicket {
  readonly producto_id: string;
  readonly asunto: string;
  readonly prioridad: PrioridadTicket;
  readonly mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private readonly http = inject(HttpClient);
  private readonly sinResponder = signal(0);

  readonly pendientes = this.sinResponder.asReadonly();

  listar(filtros: FiltrosTicket): Observable<Paginado<Ticket>> {
    let parametros = new HttpParams().set('page', filtros.page);

    for (const clave of ['buscar', 'estado', 'prioridad', 'producto_id', 'empresa_id'] as const) {
      const valor = filtros[clave].trim();
      if (valor !== '') {
        parametros = parametros.set(clave, valor);
      }
    }

    if (filtros.sin_responder) {
      parametros = parametros.set('sin_responder', 1);
    }

    return this.http.get<Paginado<Ticket>>('/api/tickets', { params: parametros });
  }

  ver(id: number): Observable<DetalleTicket> {
    return this.http.get<DetalleTicket>(`/api/tickets/${id}`);
  }

  abrir(datos: NuevoTicket, archivos: readonly File[]): Observable<Ticket> {
    const cuerpo = new FormData();
    if (datos.producto_id !== '') {
      cuerpo.append('producto_id', datos.producto_id);
    }
    cuerpo.append('asunto', datos.asunto);
    cuerpo.append('prioridad', datos.prioridad);
    cuerpo.append('mensaje', datos.mensaje);
    archivos.forEach((archivo: File) => cuerpo.append('adjuntos[]', archivo, archivo.name));

    return this.http.post<Ticket>('/api/client/tickets', cuerpo);
  }

  responder(id: number, mensaje: string, interno: boolean, archivos: readonly File[]): Observable<MensajeTicket> {
    const cuerpo = new FormData();
    cuerpo.append('mensaje', mensaje);
    cuerpo.append('interno', interno ? '1' : '0');
    archivos.forEach((archivo: File) => cuerpo.append('adjuntos[]', archivo, archivo.name));

    return this.http.post<MensajeTicket>(`/api/tickets/${id}/messages`, cuerpo).pipe(tap(() => this.refrescarPendientes()));
  }

  actualizar(id: number, cambio: CambioTicket): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/admin/tickets/${id}`, cambio).pipe(tap(() => this.refrescarPendientes()));
  }

  cerrar(id: number): Observable<Ticket> {
    return this.http.post<Ticket>(`/api/tickets/${id}/close`, {});
  }

  descargar(ticketId: number, adjunto: Adjunto): Observable<Blob> {
    return this.http.get(`/api/tickets/${ticketId}/attachments/${adjunto.id}`, { responseType: 'blob' });
  }

  resumenCliente(): Observable<ResumenCliente> {
    return this.http.get<ResumenCliente>('/api/client/summary');
  }

  refrescarPendientes(): void {
    this.http.get<{ sin_responder: number }>('/api/admin/tickets/pending').subscribe({
      next: (respuesta: { sin_responder: number }) => this.sinResponder.set(respuesta.sin_responder),
      error: () => this.sinResponder.set(0),
    });
  }
}
