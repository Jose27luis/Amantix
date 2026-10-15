import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRODUCTS } from '../../data/products';
import { REDES_SOCIALES } from '../../core/social';
import { PAGINAS_LOCALES } from '../../data/local-pages';
import { SocialIconComponent } from '../social-icon/social-icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, SocialIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  protected readonly products = PRODUCTS;
  protected readonly redes = REDES_SOCIALES;
  protected readonly soluciones = PAGINAS_LOCALES;
  protected readonly year = new Date().getFullYear();
}
