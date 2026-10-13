import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LeadsApiService } from '../../services/leads-api.service';
import { CatalogApiService } from '../../services/catalog-api.service';
import { EstadoLead, FiltrosLead, Lead, OrigenLead, Paginado, ProductoResumen } from '../../models/panel.models';
import { ESTADOS_LEAD, ORIGENES_LEAD, etiquetaEstado, etiquetaOrigen, mensajeError } from '../../models/labels';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leads.component.html',
  styleUrls: ['../../panel-shared.css', './leads.component.css'],
})
export class LeadsComponent {
  private readonly api = inject(LeadsApiService);
  private readonly router = inject(Router);

  protected readonly productos = toSignal(inject(CatalogApiService).productos$, {
    initialValue: [] as readonly ProductoResumen[],
  });
  protected readonly estados = ESTADOS_LEAD;
  protected readonly origenes = ORIGENES_LEAD;
  protected readonly etiquetaEstado = etiquetaEstado;
  protected readonly etiquetaOrigen = etiquetaOrigen;

  protected buscar = '';
  protected estado: EstadoLead | '' = '';
  protected origen: OrigenLead | '' = '';
  protected productoId = '';
  protected desde = '';
  protected hasta = '';
  private pagina = 1;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<Paginado<Lead> | null>(null);

  constructor() {
    const estadoInicial = inject(ActivatedRoute).snapshot.queryParamMap.get('estado');
    const valido = ESTADOS_LEAD.find((item) => item.valor === estadoInicial);
    if (valido) {
      this.estado = valido.valor;
    }
    this.cargar();
  }

  protected filtrar(): void {
    this.pagina = 1;
    this.cargar();
  }

  protected limpiar(): void {
    this.buscar = '';
    this.estado = '';
    this.origen = '';
    this.productoId = '';
    this.desde = '';
    this.hasta = '';
    this.filtrar();
  }

  protected irA(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  protected abrir(lead: Lead): void {
    this.router.navigate(['/panel/leads', lead.id]);
  }

  private cargar(): void {
    const filtros: FiltrosLead = {
      buscar: this.buscar,
      estado: this.estado,
      origen: this.origen,
      producto_id: this.productoId,
      desde: this.desde,
      hasta: this.hasta,
      page: this.pagina,
    };

    this.cargando.set(true);
    this.error.set(null);

    this.api.listar(filtros).subscribe({
      next: (resultado: Paginado<Lead>) => {
        this.resultado.set(resultado);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar los leads.'));
        this.cargando.set(false);
      },
    });
  }
}
