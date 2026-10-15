import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { NewsApiService } from '../../news/news-api.service';
import { DetalleNoticia, Noticia } from '../../news/news.models';
import { fechaNoticia } from '../../news/news-text';
import { SITIO_URL, SeoService } from '../../core/seo.service';
import { NewsContentComponent } from '../../components/news-content/news-content.component';
import { NewsShareComponent } from '../../components/news-share/news-share.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { ShareButtonComponent } from '../../components/share-button/share-button.component';
import { SocialFollowComponent } from '../../components/social-follow/social-follow.component';
import { SocialIconComponent } from '../../components/social-icon/social-icon.component';

type Estado =
  | { readonly tipo: 'cargando' }
  | { readonly tipo: 'no-existe' }
  | { readonly tipo: 'error' }
  | { readonly tipo: 'listo'; readonly detalle: DetalleNoticia };

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    RouterLink,
    NewsContentComponent,
    NewsShareComponent,
    NewsCardComponent,
    ShareButtonComponent,
    SocialFollowComponent,
    SocialIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent {
  private readonly api = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  protected readonly fechaNoticia = fechaNoticia;
  protected readonly sitio = SITIO_URL;

  protected enlaceWhatsapp(noticia: Noticia): string {
    return `https://wa.me/?text=${encodeURIComponent(`${noticia.titulo}\n${SITIO_URL}/noticias/${noticia.slug}`)}`;
  }

  protected enlaceFacebook(noticia: Noticia): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITIO_URL}/noticias/${noticia.slug}`)}`;
  }

  protected enlaceLinkedin(noticia: Noticia): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITIO_URL}/noticias/${noticia.slug}`)}`;
  }

  protected minutosLectura(noticia: Noticia): number {
    const palabras = (noticia.contenido ?? '').trim().split(/\s+/u).filter((palabra: string) => palabra !== '').length;
    return Math.max(1, Math.round(palabras / 200));
  }

  protected readonly estado = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((parametros) => parametros.get('slug') ?? ''),
      switchMap((slug: string) =>
        this.api.ver(slug).pipe(
          tap((detalle: DetalleNoticia) => this.aplicarSeo(detalle.noticia)),
          map((detalle: DetalleNoticia): Estado => ({ tipo: 'listo', detalle })),
          catchError((error: HttpErrorResponse) => {
            this.seo.aplicar({
              titulo: 'Noticia no encontrada',
              descripcion: 'Esta noticia no existe o ya no está publicada.',
              ruta: `/noticias/${slug}`,
              indexar: false,
            });
            return of<Estado>(error.status === 404 ? { tipo: 'no-existe' } : { tipo: 'error' });
          }),
          startWith<Estado>({ tipo: 'cargando' }),
        ),
      ),
    ),
    { initialValue: { tipo: 'cargando' } as Estado },
  );

  private aplicarSeo(noticia: Noticia): void {
    const url = `${SITIO_URL}/noticias/${noticia.slug}`;
    const organizacion = { '@id': `${SITIO_URL}/#organizacion` };

    this.seo.aplicar({
      titulo: noticia.titulo,
      descripcion: noticia.resumen,
      ruta: `/noticias/${noticia.slug}`,
      imagen: noticia.imagen.url,
      imagenAncho: noticia.imagen.ancho,
      imagenAlto: noticia.imagen.alto,
      tipo: 'article',
      publicado: noticia.publicada_en,
      modificado: noticia.actualizada_en,
      datosEstructurados: {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: noticia.titulo.slice(0, 110),
        description: noticia.resumen,
        image: [SITIO_URL + noticia.imagen.url],
        datePublished: noticia.publicada_en,
        dateModified: noticia.actualizada_en,
        mainEntityOfPage: url,
        inLanguage: 'es-PE',
        author: { '@type': 'Organization', name: 'Amantix', url: `${SITIO_URL}/` },
        publisher: organizacion,
      },
    });
  }
}
