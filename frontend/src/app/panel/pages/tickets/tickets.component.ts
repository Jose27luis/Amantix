import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TicketsApiService } from '../../services/tickets-api.service';
import { CatalogApiService } from '../../services/catalog-api.service';
import { SessionService } from '../../core/session.service';
import { EstadoTicket, Paginado, PrioridadTicket, ProductoResumen, Ticket } from '../../models/panel.models';
import { ESTADOS_TICKET, PRIORIDADES_TICKET, etiquetaEstadoTicket, etiquetaPrioridad, mensajeError } from '../../models/labels';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tickets.component.html',
  styleUrls: ['../../panel-shared.css', './tickets.component.css'],
})
export class TicketsComponent {
  private readonly api = inject(TicketsApiService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SessionService);

  protected readonly productos = toSignal(inject(CatalogApiService).productos$, {
    initialValue: [] as readonly ProductoResumen[],
  });
  protected readonly estados = ESTADOS_TICKET;
  protected readonly prioridades = PRIORIDADES_TICKET;
  protected readonly etiquetaEstado = etiquetaEstadoTicket;
  protected readonly etiquetaPrioridad = etiquetaPrioridad;

  protected buscar = '';
  protected estado: EstadoTicket | 'activos' | '' = 'activos';
  protected prioridad: PrioridadTicket | '' = '';
  protected productoId = '';
  protected sinResponder = false;
  protected readonly empresaId: string;
  private pagina = 1;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<Paginado<Ticket> | null>(null);

  constructor() {
    const parametros = inject(ActivatedRoute).snapshot.queryParamMap;
    const empresa = parametros.get('empresa_id');
    this.empresaId = empresa && /^\d+$/.test(empresa) ? empresa : '';
    if (this.empresaId !== '') {
      this.estado = '';
    }
    this.sinResponder = parametros.get('sin_responder') === '1';
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

  protected abrir(ticket: Ticket): void {
    this.router.navigate(['/panel/tickets', ticket.id]);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api
      .listar({
        buscar: this.buscar,
        estado: this.estado,
        prioridad: this.prioridad,
        producto_id: this.productoId,
        empresa_id: this.empresaId,
        sin_responder: this.sinResponder,
        page: this.pagina,
      })
      .subscribe({
        next: (resultado: Paginado<Ticket>) => {
          this.resultado.set(resultado);
          this.cargando.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(mensajeError(error, 'No pudimos cargar los tickets.'));
          this.cargando.set(false);
        },
      });
  }
}
