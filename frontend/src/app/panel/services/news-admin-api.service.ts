import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoNoticia, Noticia } from '../../news/news.models';
import { Paginado } from '../models/panel.models';

export interface DatosNoticia {
  readonly titulo: string;
  readonly resumen: string;
  readonly contenido: string;
  readonly estado: EstadoNoticia;
}

@Injectable({ providedIn: 'root' })
export class NewsAdminApiService {
  private readonly http = inject(HttpClient);

  listar(buscar: string, estado: EstadoNoticia | '', pagina: number): Observable<Paginado<Noticia>> {
    let parametros = new HttpParams().set('page', pagina);

    if (buscar.trim() !== '') {
      parametros = parametros.set('buscar', buscar.trim());
    }

    if (estado !== '') {
      parametros = parametros.set('estado', estado);
    }

    return this.http.get<Paginado<Noticia>>('/api/admin/news', { params: parametros });
  }

  ver(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`/api/admin/news/${id}`);
  }

  crear(datos: DatosNoticia, imagen: File): Observable<Noticia> {
    return this.http.post<Noticia>('/api/admin/news', this.cuerpo(datos, imagen));
  }

  actualizar(id: number, datos: DatosNoticia, imagen: File | null): Observable<Noticia> {
    return this.http.post<Noticia>(`/api/admin/news/${id}`, this.cuerpo(datos, imagen));
  }

  borrar(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/news/${id}`);
  }

  private cuerpo(datos: DatosNoticia, imagen: File | null): FormData {
    const cuerpo = new FormData();
    cuerpo.append('titulo', datos.titulo);
    cuerpo.append('resumen', datos.resumen);
    cuerpo.append('contenido', datos.contenido);
    cuerpo.append('estado', datos.estado);

    if (imagen !== null) {
      cuerpo.append('imagen', imagen, imagen.name);
    }

    return cuerpo;
  }
}
