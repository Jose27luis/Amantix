import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { ImagenSitio, SiteContentService } from '../../core/site-content.service';

@Component({
  selector: 'app-site-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-gallery.component.html',
  styleUrl: './site-gallery.component.css',
  host: {
    '(document:keydown.escape)': 'cerrar()',
    '(document:keydown.arrowright)': 'mover(1)',
    '(document:keydown.arrowleft)': 'mover(-1)',
  },
})
export class SiteGalleryComponent {
  readonly ubicacion = input.required<string>();
  readonly titulo = input('Así trabajamos');

  private readonly contenido = inject(SiteContentService);

  protected readonly imagenes = toSignal(
    toObservable(this.ubicacion).pipe(
      switchMap((ubicacion: string) => this.contenido.imagenes(ubicacion).pipe(catchError(() => of([] as readonly ImagenSitio[])))),
    ),
    { initialValue: [] as readonly ImagenSitio[] },
  );

  protected readonly abierta = signal<number | null>(null);
  protected readonly actual = computed((): ImagenSitio | null => {
    const indice = this.abierta();
    return indice === null ? null : (this.imagenes()[indice] ?? null);
  });

  protected abrir(indice: number): void {
    this.abierta.set(indice);
  }

  protected cerrar(): void {
    this.abierta.set(null);
  }

  protected mover(paso: number): void {
    const indice = this.abierta();
    const total = this.imagenes().length;
    if (indice === null || total === 0) {
      return;
    }
    this.abierta.set((indice + paso + total) % total);
  }
}
