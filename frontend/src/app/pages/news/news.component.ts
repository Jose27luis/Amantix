import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { NewsApiService } from '../../news/news-api.service';
import { PaginaNoticias } from '../../news/news.models';
import { fechaNoticia } from '../../news/news-text';
import { SITIO_URL, SeoService } from '../../core/seo.service';

type Estado = { readonly tipo: 'cargando' } | { readonly tipo: 'error' } | { readonly tipo: 'listo'; readonly pagina: PaginaNoticias };

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
})
export class NewsComponent {
  private readonly api = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  protected readonly fechaNoticia = fechaNoticia;

  protected readonly estado = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(
      map((parametros) => Math.max(1, Number(parametros.get('pagina')) || 1)),
      switchMap((pagina: number) => {
        this.aplicarSeo(pagina);
        return this.api.listar(pagina).pipe(
          map((respuesta: PaginaNoticias): Estado => ({ tipo: 'listo', pagina: respuesta })),
          catchError(() => of<Estado>({ tipo: 'error' })),
          startWith<Estado>({ tipo: 'cargando' }),
        );
      }),
    ),
    { initialValue: { tipo: 'cargando' } as Estado },
  );

  private aplicarSeo(pagina: number): void {
    this.seo.aplicar({
      titulo: pagina > 1 ? `Noticias y novedades · página ${pagina}` : 'Noticias y novedades',
      descripcion:
        'Novedades de Amantix: cambios de SUNAT, facturación electrónica, nuevas funciones de nuestros sistemas y consejos para tu negocio.',
      ruta: pagina > 1 ? `/noticias?pagina=${pagina}` : '/noticias',
      datosEstructurados: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Noticias de Amantix',
        url: `${SITIO_URL}/noticias`,
        isPartOf: { '@id': `${SITIO_URL}/#sitio` },
      },
    });
  }
}
