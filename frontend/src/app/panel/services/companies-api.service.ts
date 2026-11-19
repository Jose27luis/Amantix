import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CambioSuscripcion,
  DatosEmpresa,
  DetalleEmpresa,
  Empresa,
  NuevaSuscripcion,
  Paginado,
  Suscripcion,
  UsuarioCreado,
} from '../models/panel.models';

export interface FiltrosEmpresa {
  readonly buscar: string;
  readonly producto_id: string;
  readonly renueva_en: string;
  readonly situacion?: string;
  readonly page: number;
}

@Injectable({ providedIn: 'root' })
export class CompaniesApiService {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosEmpresa): Observable<Paginado<Empresa>> {
    let parametros = new HttpParams().set('page', filtros.page);

    for (const clave of ['buscar', 'producto_id', 'renueva_en'] as const) {
      const valor = filtros[clave].trim();
      if (valor !== '') {
        parametros = parametros.set(clave, valor);
      }
    }
    if (filtros.situacion !== undefined && filtros.situacion !== '') {
      parametros = parametros.set('situacion', filtros.situacion);
    }

    return this.http.get<Paginado<Empresa>>('/api/admin/companies', { params: parametros });
  }

  ver(id: number): Observable<DetalleEmpresa> {
    return this.http.get<DetalleEmpresa>(`/api/admin/companies/${id}`);
  }

  crear(datos: DatosEmpresa): Observable<Empresa> {
    return this.http.post<Empresa>('/api/admin/companies', datos);
  }

  actualizar(id: number, datos: Partial<DatosEmpresa>): Observable<Empresa> {
    return this.http.patch<Empresa>(`/api/admin/companies/${id}`, datos);
  }

  agregarSuscripcion(empresaId: number, datos: NuevaSuscripcion): Observable<Suscripcion> {
    return this.http.post<Suscripcion>(`/api/admin/companies/${empresaId}/subscriptions`, datos);
  }

  actualizarSuscripcion(id: number, cambio: CambioSuscripcion): Observable<Suscripcion> {
    return this.http.patch<Suscripcion>(`/api/admin/subscriptions/${id}`, cambio);
  }

  crearUsuario(empresaId: number, nombre: string, correo: string): Observable<UsuarioCreado> {
    return this.http.post<UsuarioCreado>(`/api/admin/companies/${empresaId}/users`, { nombre, correo });
  }
}
