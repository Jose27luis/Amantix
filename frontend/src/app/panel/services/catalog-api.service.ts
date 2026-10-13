import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Dashboard, ListaSimple, Plan, ProductoResumen } from '../models/panel.models';

export interface FiltrosDashboard {
  readonly desde: string;
  readonly hasta: string;
  readonly producto_id: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);

  readonly productos$: Observable<readonly ProductoResumen[]> = this.http
    .get<ListaSimple<ProductoResumen>>('/api/products')
    .pipe(
      map((respuesta: ListaSimple<ProductoResumen>) => respuesta.data),
      shareReplay(1),
    );

  readonly planes$: Observable<readonly Plan[]> = this.http.get<ListaSimple<Plan>>('/api/plans').pipe(
    map((respuesta: ListaSimple<Plan>) => respuesta.data),
    shareReplay(1),
  );

  dashboard(filtros: FiltrosDashboard): Observable<Dashboard> {
    let parametros = new HttpParams();

    for (const clave of ['desde', 'hasta', 'producto_id'] as const) {
      if (filtros[clave] !== '') {
        parametros = parametros.set(clave, filtros[clave]);
      }
    }

    return this.http.get<Dashboard>('/api/admin/dashboard', { params: parametros });
  }
}
