import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CambioImagen, ListadoImagenes, SiteImagesApiService, UbicacionImagen } from '../../services/site-images-api.service';
import { ImagenSitio } from '../../../core/site-content.service';
import { mensajeError } from '../../models/labels';
import { prepararImagen, tipoAceptado } from '../../core/image-prep';

interface Grupo {
  readonly ubicacion: UbicacionImagen;
  readonly imagenes: readonly ImagenSitio[];
}

@Component({
  selector: 'app-site-images',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-images.component.html',
  styleUrls: ['../../panel-shared.css', './site-images.component.css'],
})
export class SiteImagesComponent {
  private readonly api = inject(SiteImagesApiService);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly listado = signal<ListadoImagenes | null>(null);

  protected ubicacion = 'inicio';
  protected titulo = '';
  protected readonly archivo = signal<File | null>(null);
  protected readonly vista = signal<string | null>(null);
  protected readonly preparando = signal(false);
  protected readonly subiendo = signal(false);
  protected readonly arrastrando = signal(false);
  protected readonly ocupado = signal<number | null>(null);
  protected readonly confirmar = signal<number | null>(null);

  protected readonly grupos = computed((): readonly Grupo[] => {
    const datos = this.listado();
    if (!datos) {
      return [];
    }
    return datos.ubicaciones
      .map((ubicacion: UbicacionImagen) => ({
        ubicacion,
        imagenes: datos.data.filter((imagen: ImagenSitio) => imagen.ubicacion === ubicacion.valor),
      }))
      .filter((grupo: Grupo) => grupo.imagenes.length > 0);
  });

  constructor() {
    this.cargar();
  }

  protected async elegir(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0] ?? null;
    entrada.value = '';
    if (archivo) {
      await this.preparar(archivo);
    }
  }

  protected async soltar(evento: DragEvent): Promise<void> {
    evento.preventDefault();
    this.arrastrando.set(false);
    const archivo = evento.dataTransfer?.files?.[0] ?? null;
    if (archivo) {
      await this.preparar(archivo);
    }
  }

  protected sobre(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  protected subir(): void {
    const archivo = this.archivo();
    if (!archivo || this.titulo.trim().length < 3) {
      this.error.set('Elige una imagen y escribe una descripción de al menos 3 letras.');
      return;
    }

    this.subiendo.set(true);
    this.error.set(null);

    this.api
      .subir(this.ubicacion, this.titulo.trim(), archivo)
      .pipe(finalize(() => this.subiendo.set(false)))
      .subscribe({
        next: () => {
          this.titulo = '';
          this.limpiarVista();
          this.archivo.set(null);
          this.aviso.set('Imagen publicada. Ya aparece en la página elegida.');
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos subir la imagen.')),
      });
  }

  protected guardarTitulo(imagen: ImagenSitio, titulo: string): void {
    const limpio = titulo.trim();
    if (limpio.length >= 3 && limpio !== imagen.titulo) {
      this.cambiar(imagen, { titulo: limpio });
    }
  }

  protected mover(grupo: Grupo, indice: number, paso: number): void {
    const destino = grupo.imagenes[indice + paso];
    const actual = grupo.imagenes[indice];
    if (!destino || !actual) {
      return;
    }
    this.cambiar(actual, { orden: destino.orden });
    this.cambiar(destino, { orden: actual.orden });
  }

  protected alternarVisible(imagen: ImagenSitio): void {
    this.cambiar(imagen, { visible: !imagen.visible });
  }

  protected borrar(imagen: ImagenSitio): void {
    this.ocupado.set(imagen.id);
    this.api
      .borrar(imagen.id)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.confirmar.set(null);
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos borrar la imagen.')),
      });
  }

  private cambiar(imagen: ImagenSitio, cambio: CambioImagen): void {
    this.ocupado.set(imagen.id);
    this.api
      .actualizar(imagen.id, cambio)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (actualizada: ImagenSitio) =>
          this.listado.update((datos: ListadoImagenes | null) =>
            datos
              ? {
                  ...datos,
                  data: datos.data
                    .map((item: ImagenSitio) => (item.id === actualizada.id ? actualizada : item))
                    .sort((a: ImagenSitio, b: ImagenSitio) => a.orden - b.orden),
                }
              : datos,
          ),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos guardar el cambio.')),
      });
  }

  private async preparar(archivo: File): Promise<void> {
    if (!tipoAceptado(archivo)) {
      this.error.set('La imagen debe ser JPG, PNG o WEBP.');
      return;
    }

    this.preparando.set(true);
    this.error.set(null);
    this.aviso.set(null);

    try {
      const preparada = await prepararImagen(archivo);
      this.limpiarVista();
      this.archivo.set(preparada.archivo);
      this.vista.set(URL.createObjectURL(preparada.archivo));
      if (this.titulo.trim() === '') {
        this.titulo = archivo.name.replace(/\.[^.]+$/u, '').replace(/[-_]+/gu, ' ');
      }
    } catch {
      this.error.set('No pudimos leer la imagen. Prueba con otra.');
    } finally {
      this.preparando.set(false);
    }
  }

  private limpiarVista(): void {
    const actual = this.vista();
    if (actual) {
      URL.revokeObjectURL(actual);
    }
    this.vista.set(null);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api
      .listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (datos: ListadoImagenes) => this.listado.set(datos),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cargar las imágenes.')),
      });
  }
}
