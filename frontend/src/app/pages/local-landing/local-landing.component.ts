import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PAGINAS_LOCALES, PaginaLocal } from '../../data/local-pages';
import { PRODUCTS } from '../../data/products';
import { Product } from '../../models/product.model';
import { SITIO_URL, SeoService } from '../../core/seo.service';
import { FaqListComponent } from '../../components/faq-list/faq-list.component';

@Component({
  selector: 'app-local-landing',
  standalone: true,
  imports: [RouterLink, FaqListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './local-landing.component.html',
  styleUrl: './local-landing.component.css',
})
export class LocalLandingComponent {
  private readonly seo = inject(SeoService);

  protected readonly existe: boolean;
  protected readonly pagina: PaginaLocal;
  protected readonly producto: Product;
  protected readonly otras: readonly PaginaLocal[];
  protected readonly whatsapp: string;

  constructor() {
    const slug = inject(ActivatedRoute).snapshot.paramMap.get('slug');
    const encontrada = PAGINAS_LOCALES.find((item: PaginaLocal) => item.slug === slug);

    this.existe = encontrada !== undefined;
    this.pagina = encontrada ?? PAGINAS_LOCALES[0];
    this.producto = PRODUCTS.find((item: Product) => item.slug === this.pagina.producto) ?? PRODUCTS[0];
    this.otras = PAGINAS_LOCALES.filter((item: PaginaLocal) => item.slug !== this.pagina.slug);
    this.whatsapp = `https://wa.me/51931110735?text=${encodeURIComponent(`Hola, quiero información sobre ${this.pagina.servicio.toLowerCase()} en ${this.pagina.lugar}.`)}`;

    if (encontrada) {
      this.aplicarSeo(encontrada);
    } else {
      this.seo.aplicar({
        titulo: 'Solución no encontrada',
        descripcion: 'Esta página no existe. Revisa nuestros productos.',
        ruta: `/soluciones/${slug ?? ''}`,
        indexar: false,
      });
    }
  }

  private aplicarSeo(pagina: PaginaLocal): void {
    const url = `${SITIO_URL}/soluciones/${pagina.slug}`;
    const zona =
      pagina.lugar === 'Puerto Maldonado'
        ? { '@type': 'City', name: 'Puerto Maldonado', containedInPlace: { '@type': 'AdministrativeArea', name: 'Madre de Dios' } }
        : { '@type': 'AdministrativeArea', name: 'Madre de Dios', containedInPlace: { '@type': 'Country', name: 'Perú' } };

    this.seo.aplicar({
      titulo: pagina.tituloSeo,
      descripcion: pagina.descripcionSeo,
      ruta: `/soluciones/${pagina.slug}`,
      imagen: pagina.imagen,
      datosEstructurados: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Service',
            '@id': `${url}#servicio`,
            name: pagina.titulo,
            serviceType: pagina.servicio,
            description: pagina.descripcionSeo,
            url,
            areaServed: zona,
            provider: { '@id': `${SITIO_URL}/#organizacion` },
            offers: { '@type': 'Offer', priceCurrency: 'PEN', price: '80', url: `${SITIO_URL}/planes` },
          },
          {
            '@type': 'FAQPage',
            mainEntity: pagina.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.pregunta,
              acceptedAnswer: { '@type': 'Answer', text: faq.respuesta },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Soluciones', item: `${SITIO_URL}/productos` },
              { '@type': 'ListItem', position: 3, name: pagina.titulo, item: url },
            ],
          },
        ],
      },
    });
  }
}
