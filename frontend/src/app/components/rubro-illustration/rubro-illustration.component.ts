import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TipoIlustracion = 'facturacion' | 'restaurante' | 'agente' | 'farmacia';

@Component({
  selector: 'app-rubro-illustration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rubro-illustration.component.html',
  styleUrl: './rubro-illustration.component.css',
})
export class RubroIllustrationComponent {
  readonly tipo = input.required<TipoIlustracion>();
}
