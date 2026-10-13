import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NewsAdminApiService } from '../../services/news-admin-api.service';
import { EstadoNoticia, Noticia } from '../../../news/news.models';
import { fechaNoticia } from '../../../news/news-text';
import { Paginado } from '../../models/panel.models';
import { mensajeError } from '../../models/labels';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-list.component.html',
  styleUrls: ['../../panel-shared.css', './news-list.component.css'],
})
export class NewsListComponent {
  private readonly api = inject(NewsAdminApiService);
  private readonly router = inject(Router);

  protected readonly fechaNoticia = fechaNoticia;

  protected buscar = '';
  protected estado: EstadoNoticia | '' = '';
  private pagina = 1;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<Paginado<Noticia> | null>(null);

  constructor() {
    this.cargar();
  }

  protected filtrar(): void {
    this.pagina = 1;
    this.cargar();
  }

  protected irA(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  protected abrir(noticia: Noticia): void {
    this.router.navigate(['/panel/news', noticia.id]);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api.listar(this.buscar, this.estado, this.pagina).subscribe({
      next: (resultado: Paginado<Noticia>) => {
        this.resultado.set(resultado);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar las noticias.'));
        this.cargando.set(false);
      },
    });
  }
}
