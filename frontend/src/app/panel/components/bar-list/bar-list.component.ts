import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FilaConteo } from '../../models/panel.models';

interface FilaBarra extends FilaConteo {
  readonly porcentaje: number;
  readonly participacion: number;
}

@Component({
  selector: 'app-bar-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bar-list.component.html',
  styleUrl: './bar-list.component.css',
})
export class BarListComponent {
  readonly filas = input.required<readonly FilaConteo[]>();
  readonly formato = input<(valor: number) => string>((valor: number) => String(valor));
  readonly tono = input<'brass' | 'teal' | 'steel'>('steel');

  protected readonly barras = computed((): readonly FilaBarra[] => {
    const filas = this.filas();
    const maximo = Math.max(0, ...filas.map((fila: FilaConteo) => fila.total));
    const suma = filas.reduce((total: number, fila: FilaConteo) => total + fila.total, 0);

    return filas.map((fila: FilaConteo): FilaBarra => ({
      ...fila,
      porcentaje: maximo === 0 ? 0 : (fila.total / maximo) * 100,
      participacion: suma === 0 ? 0 : Math.round((fila.total / suma) * 100),
    }));
  });
}
