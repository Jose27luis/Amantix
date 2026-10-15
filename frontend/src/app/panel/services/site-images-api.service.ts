import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ImagenSitio } from '../../core/site-content.service';

export interface UbicacionImagen {
  readonly valor: string;
  readonly etiqueta: string;
}

export interface ListadoImagenes {
  readonly data: readonly ImagenSitio[];
  readonly ubicaciones: readonly UbicacionImagen[];
}

export interface CambioImagen {
  readonly ubicacion?: string;
  readonly titulo?: string;
  readonly orden?: number;
  readonly visible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SiteImagesApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<ListadoImagenes> {
    return this.http.get<ListadoImagenes>('/api/admin/site-images');
  }

  subir(ubicacion: string, titulo: string, archivo: File): Observable<ImagenSitio> {
    const cuerpo = new FormData();
    cuerpo.append('ubicacion', ubicacion);
    cuerpo.append('titulo', titulo);
    cuerpo.append('imagen', archivo, archivo.name);
    return this.http.post<ImagenSitio>('/api/admin/site-images', cuerpo);
  }

  actualizar(id: number, cambio: CambioImagen): Observable<ImagenSitio> {
    return this.http.patch<ImagenSitio>(`/api/admin/site-images/${id}`, cambio);
  }

  borrar(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/site-images/${id}`);
  }
}
