import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRODUCTS } from '../../data/products';
import { SITIO_URL, SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent {
  protected readonly products = PRODUCTS;

  constructor() {
    inject(SeoService).aplicar({
      titulo: 'Productos: facturador SUNAT, sistema para restaurantes y agente multibancario',
      descripcion:
        'Conoce los sistemas de Amantix: Facturador Amantix para comprobantes SUNAT, Restaurant Sumaqta para restaurantes y Agente Amantix para agentes multibancarios.',
      ruta: '/productos',
      datosEstructurados: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: PRODUCTS.map((producto, indice) => ({
          '@type': 'ListItem',
          position: indice + 1,
          url: `${SITIO_URL}/productos/${producto.slug}`,
          name: producto.name,
        })),
      },
    });
  }
}
