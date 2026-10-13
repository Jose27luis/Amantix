import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginado, Rol, Usuario, UsuarioCreado } from '../models/panel.models';

export interface CambioUsuario {
  readonly nombre?: string;
  readonly correo?: string;
  readonly activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  listar(buscar: string, pagina: number, rol: Rol | '' = ''): Observable<Paginado<Usuario>> {
    let parametros = new HttpParams().set('page', pagina);

    if (buscar.trim() !== '') {
      parametros = parametros.set('buscar', buscar.trim());
    }

    if (rol !== '') {
      parametros = parametros.set('rol', rol);
    }

    return this.http.get<Paginado<Usuario>>('/api/admin/users', { params: parametros });
  }

  crear(nombre: string, correo: string): Observable<UsuarioCreado> {
    return this.http.post<UsuarioCreado>('/api/admin/users', { nombre, correo, rol: 'administrador' });
  }

  actualizar(id: number, cambio: CambioUsuario): Observable<Usuario> {
    return this.http.patch<Usuario>(`/api/admin/users/${id}`, cambio);
  }

  restablecerPassword(id: number): Observable<{ password_temporal: string }> {
    return this.http.post<{ password_temporal: string }>(`/api/admin/users/${id}/reset-password`, {});
  }
}
