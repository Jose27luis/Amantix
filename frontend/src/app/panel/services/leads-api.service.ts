import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { CambioLead, DetalleLead, FiltrosLead, Lead, NotaLead, Paginado } from '../models/panel.models';

@Injectable({ providedIn: 'root' })
export class LeadsApiService {
  private readonly http = inject(HttpClient);
  private readonly nuevos = signal(0);

  readonly pendientes = this.nuevos.asReadonly();

  listar(filtros: FiltrosLead): Observable<Paginado<Lead>> {
    let parametros = new HttpParams().set('page', filtros.page);

    for (const clave of ['buscar', 'estado', 'origen', 'producto_id', 'desde', 'hasta'] as const) {
      const valor = filtros[clave].trim();
      if (valor !== '') {
        parametros = parametros.set(clave, valor);
      }
    }

    return this.http.get<Paginado<Lead>>('/api/admin/leads', { params: parametros });
  }

  ver(id: number): Observable<DetalleLead> {
    return this.http.get<DetalleLead>(`/api/admin/leads/${id}`);
  }

  actualizar(id: number, cambio: CambioLead): Observable<Lead> {
    return this.http.patch<Lead>(`/api/admin/leads/${id}`, cambio).pipe(tap(() => this.refrescarPendientes()));
  }

  agregarNota(id: number, nota: string): Observable<NotaLead> {
    return this.http.post<NotaLead>(`/api/admin/leads/${id}/notes`, { nota });
  }

  refrescarPendientes(): void {
    this.http
      .get<{ nuevos: number }>('/api/admin/leads/pending')
      .pipe(map((respuesta: { nuevos: number }) => respuesta.nuevos))
      .subscribe({ next: (total: number) => this.nuevos.set(total), error: () => this.nuevos.set(0) });
  }
}
