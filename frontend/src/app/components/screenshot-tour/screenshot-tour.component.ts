import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { PuntoRecorrido, Recorrido } from '../../data/tours';

@Component({
  selector: 'app-screenshot-tour',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './screenshot-tour.component.html',
  styleUrl: './screenshot-tour.component.css',
})
export class ScreenshotTourComponent {
  readonly recorrido = input.required<Recorrido>();
  readonly nombre = input.required<string>();

  protected readonly activo = signal(0);
  protected readonly punto = computed((): PuntoRecorrido => this.recorrido().puntos[this.activo()] ?? this.recorrido().puntos[0]);

  protected mover(paso: number): void {
    const total = this.recorrido().puntos.length;
    this.activo.update((indice: number) => (indice + paso + total) % total);
  }
}
