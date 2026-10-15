import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGINAS_LOCALES } from '../../data/local-pages';
import { RubroIllustrationComponent } from '../rubro-illustration/rubro-illustration.component';

@Component({
  selector: 'app-local-solutions',
  standalone: true,
  imports: [RouterLink, RubroIllustrationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './local-solutions.component.html',
  styleUrl: './local-solutions.component.css',
})
export class LocalSolutionsComponent {
  protected readonly soluciones = PAGINAS_LOCALES;
}
