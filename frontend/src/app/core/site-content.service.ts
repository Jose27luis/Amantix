import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export type SeccionImagen = 'galeria' | 'portada' | 'control' | 'beneficio-1' | 'beneficio-2' | 'beneficio-3' | 'beneficio-4';

export interface ImagenSitio {
  readonly id: number;
  readonly ubicacion: string;
  readonly seccion: SeccionImagen;
  readonly titulo: string;
  readonly url: string;
  readonly ancho: number;
  readonly alto: number;
  readonly orden: number;
  readonly visible: boolean;
}

export interface CifrasPublicas {
  readonly sistemas: number;
  readonly empresas: number;
  readonly noticias: number;
  readonly tickets_resueltos: number;
}

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private readonly http = inject(HttpClient);

  imagenes(ubicacion: string): Observable<readonly ImagenSitio[]> {
    return this.http
      .get<{ data: readonly ImagenSitio[] }>('/api/site-images', { params: new HttpParams().set('ubicacion', ubicacion) })
      .pipe(map((respuesta: { data: readonly ImagenSitio[] }) => respuesta.data));
  }

  cifras(): Observable<CifrasPublicas> {
    return this.http.get<CifrasPublicas>('/api/stats');
  }
}
