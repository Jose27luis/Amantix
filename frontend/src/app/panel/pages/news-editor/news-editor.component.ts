import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { NewsAdminApiService, DatosNoticia } from '../../services/news-admin-api.service';
import { EstadoNoticia, Noticia } from '../../../news/news.models';
import { fechaNoticia } from '../../../news/news-text';
import { mensajeError } from '../../models/labels';
import { prepararImagen, tipoAceptado } from '../../core/image-prep';
import { NewsContentComponent } from '../../../components/news-content/news-content.component';
import { SocialPublishComponent } from '../../components/social-publish/social-publish.component';

const BYTES_MAXIMOS = 8 * 1024 * 1024;

@Component({
  selector: 'app-news-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, NewsContentComponent, SocialPublishComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-editor.component.html',
  styleUrls: ['../../panel-shared.css', './news-editor.component.css'],
})
export class NewsEditorComponent implements OnInit {
  readonly id = input<string | undefined>(undefined);

  private readonly api = inject(NewsAdminApiService);
  private readonly router = inject(Router);

  protected readonly fechaNoticia = fechaNoticia;

  protected readonly noticia = signal<Noticia | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly guardado = signal<string | null>(null);
  protected readonly vista = signal<'editar' | 'previa'>('editar');
  protected readonly confirmarBorrado = signal(false);
  protected readonly procesandoImagen = signal(false);
  protected readonly arrastrando = signal(false);

  protected readonly titulo = signal('');
  protected readonly resumen = signal('');
  protected readonly contenido = signal('');
  protected readonly estado = signal<EstadoNoticia>('borrador');
  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaImagen = signal<string | null>(null);
  protected readonly medidas = signal<string | null>(null);

  protected readonly esNueva = computed(() => this.id() === undefined);
  protected readonly largoTitulo = computed(() => this.titulo().trim().length);
  protected readonly largoResumen = computed(() => this.resumen().trim().length);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.liberarVista());
  }

  ngOnInit(): void {
    const id = this.id();
    if (id !== undefined) {
      this.cargar(Number(id));
    }
  }

  protected async elegirArchivo(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0] ?? null;
    entrada.value = '';
    if (archivo) {
      await this.usarArchivo(archivo);
    }
  }

  protected async soltar(evento: DragEvent): Promise<void> {
    evento.preventDefault();
    this.arrastrando.set(false);
    const archivo = evento.dataTransfer?.files?.[0] ?? null;
    if (archivo) {
      await this.usarArchivo(archivo);
    }
  }

  protected sobre(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  protected guardar(): void {
    const imagen = this.imagen();
    const titulo = this.titulo().trim();
    const contenido = this.contenido().trim();

    if (titulo.length < 6) {
      this.error.set('Escribe un título de al menos 6 caracteres.');
      return;
    }
    if (contenido.length < 20) {
      this.error.set('El texto de la noticia es muy corto.');
      return;
    }
    const datos: DatosNoticia = { titulo, resumen: this.resumen().trim(), contenido, estado: this.estado() };
    const actual = this.noticia();
    let peticion: Observable<Noticia>;

    if (actual === null) {
      if (imagen === null) {
        this.error.set('Elige una imagen para la noticia.');
        return;
      }
      peticion = this.api.crear(datos, imagen);
    } else {
      peticion = this.api.actualizar(actual.id, datos, imagen);
    }

    this.guardando.set(true);
    this.error.set(null);
    this.guardado.set(null);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (resultado: Noticia) => {
        if (this.esNueva()) {
          this.router.navigate(['/panel/news', resultado.id]);
          return;
        }
        this.aplicar(resultado);
        this.guardado.set(resultado.estado === 'publicada' ? 'Cambios guardados y publicados.' : 'Borrador guardado.');
      },
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos guardar la noticia.')),
    });
  }

  protected borrar(): void {
    const actual = this.noticia();
    if (!actual) {
      return;
    }

    this.guardando.set(true);
    this.api
      .borrar(actual.id)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/panel/news']),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos borrar la noticia.')),
      });
  }

  private async usarArchivo(archivo: File): Promise<void> {
    if (!tipoAceptado(archivo)) {
      this.error.set('La imagen debe ser JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > BYTES_MAXIMOS * 4) {
      this.error.set('La imagen es demasiado pesada. Usa una de menos de 30 MB.');
      return;
    }

    this.procesandoImagen.set(true);
    this.error.set(null);

    try {
      const preparada = await prepararImagen(archivo);
      if (preparada.archivo.size > BYTES_MAXIMOS) {
        this.error.set('La imagen sigue pesando más de 8 MB después de reducirla.');
        return;
      }
      this.liberarVista();
      this.imagen.set(preparada.archivo);
      this.vistaImagen.set(URL.createObjectURL(preparada.archivo));
      this.medidas.set(`${preparada.ancho} × ${preparada.alto} px · ${Math.max(1, Math.round(preparada.archivo.size / 1024))} KB`);
    } catch {
      this.error.set('No pudimos leer la imagen. Prueba con otra.');
    } finally {
      this.procesandoImagen.set(false);
    }
  }

  private liberarVista(): void {
    const actual = this.vistaImagen();
    if (actual && actual.startsWith('blob:')) {
      URL.revokeObjectURL(actual);
    }
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.api
      .ver(id)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (noticia: Noticia) => this.aplicar(noticia),
        error: (error: HttpErrorResponse) =>
          this.error.set(error.status === 404 ? 'Esta noticia no existe.' : mensajeError(error, 'No pudimos cargar la noticia.')),
      });
  }

  private aplicar(noticia: Noticia): void {
    this.liberarVista();
    this.noticia.set(noticia);
    this.titulo.set(noticia.titulo);
    this.resumen.set(noticia.resumen);
    this.contenido.set(noticia.contenido ?? '');
    this.estado.set(noticia.estado);
    this.imagen.set(null);
    this.vistaImagen.set(noticia.imagen.url);
    this.medidas.set(`${noticia.imagen.ancho} × ${noticia.imagen.alto} px`);
  }
}
