import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ImagenSitio } from '../../core/site-content.service';

@Component({
  selector: 'app-screen-frame',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './screen-frame.component.html',
  styleUrl: './screen-frame.component.css',
  host: {
    '(document:keydown.escape)': 'ampliada.set(null)',
  },
})
export class ScreenFrameComponent {
  readonly imagenes = input.required<readonly ImagenSitio[]>();
  readonly nombre = input.required<string>();

  protected readonly principal = computed((): ImagenSitio | null => this.imagenes()[0] ?? null);
  protected readonly secundaria = computed((): ImagenSitio | null => this.imagenes()[1] ?? null);
  protected readonly ampliada = signal<ImagenSitio | null>(null);
}
