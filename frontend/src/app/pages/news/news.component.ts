import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { NewsApiService } from '../../news/news-api.service';
import { Noticia, PaginaNoticias } from '../../news/news.models';
import { fechaNoticia } from '../../news/news-text';
import { SITIO_URL, SeoService } from '../../core/seo.service';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { ShareButtonComponent } from '../../components/share-button/share-button.component';
import { SocialFollowComponent } from '../../components/social-follow/social-follow.component';
import { REDES_SOCIALES } from '../../core/social';
import { SocialIconComponent } from '../../components/social-icon/social-icon.component';

type Estado = { readonly tipo: 'cargando' } | { readonly tipo: 'error' } | { readonly tipo: 'listo'; readonly pagina: PaginaNoticias };

const POSICION_SIGUENOS = 4;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [RouterLink, NewsCardComponent, ShareButtonComponent, SocialFollowComponent, SocialIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
})
export class NewsComponent {
  private readonly api = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  protected readonly fechaNoticia = fechaNoticia;
  protected readonly sitio = SITIO_URL;
  protected readonly redes = REDES_SOCIALES;
  protected readonly posicionSiguenos = POSICION_SIGUENOS;

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

  protected readonly pagina = computed((): PaginaNoticias | null => {
    const actual = this.estado();
    return actual.tipo === 'listo' ? actual.pagina : null;
  });

  protected readonly destacada = computed((): Noticia | null => {
    const pagina = this.pagina();
    return pagina && pagina.meta.current_page === 1 ? (pagina.data[0] ?? null) : null;
  });

  protected readonly resto = computed((): readonly Noticia[] => {
    const pagina = this.pagina();
    if (!pagina) {
      return [];
    }
    return this.destacada() ? pagina.data.slice(1) : pagina.data;
  });

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
