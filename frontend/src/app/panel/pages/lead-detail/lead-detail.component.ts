import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LeadsApiService } from '../../services/leads-api.service';
import { UsersApiService } from '../../services/users-api.service';
import {
  CambioLead,
  DetalleLead,
  EstadoLead,
  Lead,
  NotaLead,
  Paginado,
  RegistroHistorial,
  Usuario,
} from '../../models/panel.models';
import {
  ESTADOS_LEAD,
  enlaceWhatsapp,
  etiquetaAccion,
  etiquetaEstado,
  etiquetaOrigen,
  mensajeError,
} from '../../models/labels';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lead-detail.component.html',
  styleUrls: ['../../panel-shared.css', './lead-detail.component.css'],
})
export class LeadDetailComponent implements OnInit {
  readonly id = input.required({ transform: numberAttribute });

  private readonly api = inject(LeadsApiService);
  private readonly usuariosApi = inject(UsersApiService);

  protected readonly estados = ESTADOS_LEAD;
  protected readonly etiquetaEstado = etiquetaEstado;
  protected readonly etiquetaOrigen = etiquetaOrigen;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly lead = signal<Lead | null>(null);
  protected readonly notas = signal<readonly NotaLead[]>([]);
  protected readonly historial = signal<readonly RegistroHistorial[]>([]);
  protected readonly administradores = signal<readonly Usuario[]>([]);

  protected estado: EstadoLead = 'nuevo';
  protected motivo = '';
  protected asignadoA = '';
  protected nota = '';

  protected readonly guardando = signal(false);
  protected readonly mensajeGuardado = signal<string | null>(null);
  protected readonly errorGuardado = signal<string | null>(null);
  protected readonly enviandoNota = signal(false);
  protected readonly errorNota = signal<string | null>(null);

  protected readonly whatsapp = computed(() => enlaceWhatsapp(this.lead()?.telefono ?? null));

  ngOnInit(): void {
    this.cargar();
    this.usuariosApi.listar('', 1, 'administrador').subscribe({
      next: (resultado: Paginado<Usuario>) => this.administradores.set(resultado.data.filter((usuario) => usuario.activo)),
    });
  }

  protected guardar(): void {
    const actual = this.lead();
    if (!actual || this.guardando()) {
      return;
    }

    const cambio: CambioLead = {
      estado: this.estado,
      motivo_perdida: this.estado === 'perdido' ? this.motivo.trim() : null,
      asignado_a: this.asignadoA === '' ? null : Number(this.asignadoA),
    };

    this.guardando.set(true);
    this.mensajeGuardado.set(null);
    this.errorGuardado.set(null);

    this.api
      .actualizar(actual.id, cambio)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.mensajeGuardado.set('Cambios guardados.');
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorGuardado.set(mensajeError(error, 'No pudimos guardar los cambios.')),
      });
  }

  protected agregarNota(): void {
    const actual = this.lead();
    const texto = this.nota.trim();
    if (!actual || texto === '' || this.enviandoNota()) {
      return;
    }

    this.enviandoNota.set(true);
    this.errorNota.set(null);

    this.api
      .agregarNota(actual.id, texto)
      .pipe(finalize(() => this.enviandoNota.set(false)))
      .subscribe({
        next: (nueva: NotaLead) => {
          this.notas.update((notas: readonly NotaLead[]) => [nueva, ...notas]);
          this.nota = '';
        },
        error: (error: HttpErrorResponse) => this.errorNota.set(mensajeError(error, 'No pudimos guardar la nota.')),
      });
  }

  protected describir(registro: RegistroHistorial): string {
    const detalle = registro.detalle;

    if (registro.accion === 'lead_estado' && detalle) {
      const de = etiquetaEstado(String(detalle['de']) as EstadoLead);
      const a = etiquetaEstado(String(detalle['a']) as EstadoLead);
      const motivo = detalle['motivo'] ? ` · Motivo: ${String(detalle['motivo'])}` : '';
      return `${de} → ${a}${motivo}`;
    }

    if (registro.accion === 'lead_asignado' && detalle) {
      const id = detalle['usuario_id'];
      if (id === null) {
        return 'Sin responsable';
      }
      const usuario = this.administradores().find((item: Usuario) => item.id === Number(id));
      return usuario ? `Asignado a ${usuario.nombre}` : 'Asignado a otro usuario';
    }

    return etiquetaAccion(registro.accion);
  }

  protected titulo(registro: RegistroHistorial): string {
    return etiquetaAccion(registro.accion);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api.ver(this.id()).subscribe({
      next: (detalle: DetalleLead) => {
        this.lead.set(detalle.lead);
        this.notas.set(detalle.notas);
        this.historial.set(detalle.historial);
        this.estado = detalle.lead.estado;
        this.motivo = detalle.lead.motivo_perdida ?? '';
        this.asignadoA = detalle.lead.asignado ? String(detalle.lead.asignado.id) : '';
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 404 ? 'Este lead no existe.' : mensajeError(error, 'No pudimos cargar el lead.'));
        this.cargando.set(false);
      },
    });
  }
}
