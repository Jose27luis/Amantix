import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogApiService, FiltrosDashboard } from '../../services/catalog-api.service';
import {
  Dashboard,
  FilaConteo,
  MetricasClientes,
  MetricasLeads,
  MetricasSoporte,
  ProductoResumen,
} from '../../models/panel.models';
import {
  etiquetaEstado,
  etiquetaEstadoTicket,
  etiquetaOrigen,
  formatoMinutos,
  formatoSoles,
  mensajeError,
} from '../../models/labels';
import { ColumnChartComponent, ColumnPoint } from '../../components/column-chart/column-chart.component';
import { BarListComponent } from '../../components/bar-list/bar-list.component';

function fechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function formatoCorto(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, ColumnChartComponent, BarListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['../../panel-shared.css', './dashboard.component.css'],
})
export class DashboardComponent {
  private readonly api = inject(CatalogApiService);

  protected readonly productos = toSignal(this.api.productos$, { initialValue: [] as readonly ProductoResumen[] });

  protected desde = fechaLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  protected hasta = fechaLocal(new Date());
  protected productoId = '';

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly datos = signal<Dashboard | null>(null);

  protected readonly leads = computed((): MetricasLeads | null => this.datos()?.leads ?? null);

  protected readonly variacion = computed((): string | null => {
    const leads = this.leads();
    if (!leads) {
      return null;
    }
    const { leads: actual, leads_periodo_anterior: anterior } = leads.indicadores;
    if (anterior === 0) {
      return actual === 0 ? 'Sin cambios frente al periodo anterior' : 'Sin leads en el periodo anterior';
    }
    const cambio = Math.round(((actual - anterior) / anterior) * 100);
    return `${cambio > 0 ? '+' : ''}${cambio} % frente al periodo anterior`;
  });

  protected readonly semanas = computed((): readonly ColumnPoint[] =>
    (this.leads()?.por_semana ?? []).map((semana) => ({
      etiqueta: formatoCorto(semana.semana),
      detalle: `Semana del ${formatoCorto(semana.semana)}`,
      valor: semana.total,
    })),
  );

  protected readonly porProducto = computed((): readonly FilaConteo[] =>
    (this.leads()?.por_producto ?? []).map((fila) => ({ etiqueta: fila.producto, total: fila.total })),
  );

  protected readonly porOrigen = computed((): readonly FilaConteo[] =>
    (this.leads()?.por_origen ?? []).map((fila) => ({ etiqueta: etiquetaOrigen(fila.origen), total: fila.total })),
  );

  protected readonly embudo = computed((): readonly FilaConteo[] =>
    (this.leads()?.embudo ?? []).map((fila) => ({ etiqueta: etiquetaEstado(fila.estado), total: fila.total })),
  );

  protected readonly clientes = computed((): MetricasClientes | null => this.datos()?.clientes ?? null);
  protected readonly soporte = computed((): MetricasSoporte | null => this.datos()?.soporte ?? null);
  protected readonly formatoSoles = formatoSoles;
  protected readonly formatoMinutos = formatoMinutos;

  protected readonly ingresoPorProducto = computed((): readonly FilaConteo[] =>
    (this.clientes()?.ingreso_por_producto ?? []).map((fila) => ({ etiqueta: fila.producto, total: fila.monto })),
  );

  protected readonly ticketsPorEstado = computed((): readonly FilaConteo[] =>
    (this.soporte()?.por_estado ?? []).map((fila) => ({ etiqueta: etiquetaEstadoTicket(fila.estado), total: fila.total })),
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    const filtros: FiltrosDashboard = { desde: this.desde, hasta: this.hasta, producto_id: this.productoId };
    this.cargando.set(true);
    this.error.set(null);

    this.api.dashboard(filtros).subscribe({
      next: (datos: Dashboard) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar el dashboard.'));
        this.cargando.set(false);
      },
    });
  }
}
