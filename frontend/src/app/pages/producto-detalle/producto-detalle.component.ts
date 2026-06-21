import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PRODUCTS } from '../../data/products';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css',
})
export class ProductoDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly product: Product;

  protected get host(): string {
    return this.product.productionUrl.replace(/^https?:\/\//, '');
  }

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    const match = PRODUCTS.find((item) => item.slug === slug);
    if (!match) {
      this.router.navigate(['/productos']);
      this.product = PRODUCTS[0];
      return;
    }
    this.product = match;
  }
}
