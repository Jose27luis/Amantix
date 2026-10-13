import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DetalleNoticia, PaginaNoticias } from './news.models';

@Injectable({ providedIn: 'root' })
export class NewsApiService {
  private readonly http = inject(HttpClient);

  listar(pagina: number): Observable<PaginaNoticias> {
    return this.http.get<PaginaNoticias>('/api/news', { params: new HttpParams().set('page', pagina) });
  }

  ver(slug: string): Observable<DetalleNoticia> {
    return this.http.get<DetalleNoticia>(`/api/news/${encodeURIComponent(slug)}`);
  }
}
