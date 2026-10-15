import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PRODUCTS } from '../../data/products';
import { PAGINAS_LOCALES, PaginaLocal } from '../../data/local-pages';
import { Product } from '../../models/product.model';
import { SITIO_URL, SeoService } from '../../core/seo.service';
import { FaqListComponent } from '../../components/faq-list/faq-list.component';
import { SiteGalleryComponent } from '../../components/site-gallery/site-gallery.component';
import { DemoSectionComponent } from '../../components/demo-section/demo-section.component';

const CATEGORIAS: Readonly<Record<Product['systemRef'], string>> = {
  pro8: 'BusinessApplication',
  mozo4: 'BusinessApplication',
  agente: 'FinanceApplication',
};

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [RouterLink, FaqListComponent, SiteGalleryComponent, DemoSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css',
})
export class ProductoDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly product: Product;
  protected readonly soluciones: readonly PaginaLocal[];

  protected get host(): string {
    return this.product.productionUrl.replace(/^https?:\/\//, '');
  }

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    const match = PRODUCTS.find((item) => item.slug === slug);
    if (!match) {
      this.router.navigate(['/productos']);
      this.product = PRODUCTS[0];
      this.soluciones = [];
      return;
    }
    this.product = match;
    this.soluciones = PAGINAS_LOCALES.filter((pagina: PaginaLocal) => pagina.producto === match.slug);
    this.aplicarSeo(match);
  }

  private aplicarSeo(producto: Product): void {
    const url = `${SITIO_URL}/productos/${producto.slug}`;

    this.seo.aplicar({
      titulo: producto.name,
      descripcion: producto.shortDescription,
      ruta: `/productos/${producto.slug}`,
      imagen: producto.image,
      datosEstructurados: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'SoftwareApplication',
            name: producto.name,
            description: producto.description,
            url,
            image: SITIO_URL + producto.image,
            applicationCategory: CATEGORIAS[producto.systemRef],
            operatingSystem: 'Web',
            inLanguage: 'es-PE',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'PEN',
              lowPrice: '80',
              highPrice: '120',
              offerCount: 3,
              url: `${SITIO_URL}/planes`,
            },
            publisher: { '@id': `${SITIO_URL}/#organizacion` },
          },
          {
            '@type': 'FAQPage',
            mainEntity: producto.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.pregunta,
              acceptedAnswer: { '@type': 'Answer', text: faq.respuesta },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Productos', item: `${SITIO_URL}/productos` },
              { '@type': 'ListItem', position: 3, name: producto.name, item: url },
            ],
          },
        ],
      },
    });
  }
}
