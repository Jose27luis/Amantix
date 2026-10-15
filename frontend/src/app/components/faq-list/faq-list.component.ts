import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PreguntaFrecuente } from '../../models/product.model';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.css',
})
export class FaqListComponent {
  readonly preguntas = input.required<readonly PreguntaFrecuente[]>();
}
