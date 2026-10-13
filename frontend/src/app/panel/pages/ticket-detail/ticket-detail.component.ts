import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TicketsApiService } from '../../services/tickets-api.service';
import { UsersApiService } from '../../services/users-api.service';
import { SessionService } from '../../core/session.service';
import {
  Adjunto,
  DetalleTicket,
  EstadoTicket,
  MensajeTicket,
  Paginado,
  PrioridadTicket,
  RegistroHistorial,
  Ticket,
  Usuario,
} from '../../models/panel.models';
import {
  ESTADOS_TICKET,
  PRIORIDADES_TICKET,
  etiquetaAccion,
  etiquetaEstadoTicket,
  etiquetaPrioridad,
  formatoTamano,
  mensajeError,
} from '../../models/labels';
import { FilePickerComponent } from '../../components/file-picker/file-picker.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, LowerCasePipe, FilePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['../../panel-shared.css', './ticket-detail.component.css'],
})
export class TicketDetailComponent implements OnInit {
  readonly id = input.required({ transform: numberAttribute });

  private readonly api = inject(TicketsApiService);
  private readonly usuariosApi = inject(UsersApiService);
  protected readonly sesion = inject(SessionService);

  protected readonly estados = ESTADOS_TICKET;
  protected readonly prioridades = PRIORIDADES_TICKET;
  protected readonly etiquetaEstado = etiquetaEstadoTicket;
  protected readonly etiquetaPrioridad = etiquetaPrioridad;
  protected readonly etiquetaAccion = etiquetaAccion;
  protected readonly formatoTamano = formatoTamano;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly ticket = signal<Ticket | null>(null);
  protected readonly mensajes = signal<readonly MensajeTicket[]>([]);
  protected readonly historial = signal<readonly RegistroHistorial[]>([]);
  protected readonly administradores = signal<readonly Usuario[]>([]);

  protected respuesta = '';
  protected interno = false;
  protected readonly archivos = signal<readonly File[]>([]);
  protected readonly enviando = signal(false);
  protected readonly errorRespuesta = signal<string | null>(null);

  protected estado: EstadoTicket = 'abierto';
  protected prioridad: PrioridadTicket = 'media';
  protected asignadoA = '';
  protected readonly guardando = signal(false);
  protected readonly errorGestion = signal<string | null>(null);
  protected readonly mensajeGestion = signal<string | null>(null);
  protected readonly cerrando = signal(false);

  protected readonly puedeResponder = computed(() => {
    const actual = this.ticket();
    if (!actual || actual.estado === 'cerrado') {
      return false;
    }
    return this.sesion.esAdministrador() || actual.estado !== 'resuelto' || actual.puede_reabrirse;
  });

  ngOnInit(): void {
    this.cargar();

    if (this.sesion.esAdministrador()) {
      this.usuariosApi.listar('', 1, 'administrador').subscribe({
        next: (resultado: Paginado<Usuario>) => this.administradores.set(resultado.data.filter((usuario: Usuario) => usuario.activo)),
      });
    }
  }

  protected responder(): void {
    const actual = this.ticket();
    const texto = this.respuesta.trim();
    if (!actual || texto === '' || this.enviando()) {
      return;
    }

    this.enviando.set(true);
    this.errorRespuesta.set(null);

    this.api
      .responder(actual.id, texto, this.interno, this.archivos())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.respuesta = '';
          this.interno = false;
          this.archivos.set([]);
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorRespuesta.set(mensajeError(error, 'No pudimos enviar tu mensaje.')),
      });
  }

  protected guardarGestion(): void {
    const actual = this.ticket();
    if (!actual || this.guardando()) {
      return;
    }

    this.guardando.set(true);
    this.errorGestion.set(null);
    this.mensajeGestion.set(null);

    this.api
      .actualizar(actual.id, {
        estado: this.estado,
        prioridad: this.prioridad,
        asignado_a: this.asignadoA === '' ? null : Number(this.asignadoA),
      })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.mensajeGestion.set('Cambios guardados.');
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorGestion.set(mensajeError(error, 'No pudimos guardar los cambios.')),
      });
  }

  protected cerrar(): void {
    const actual = this.ticket();
    if (!actual || this.cerrando()) {
      return;
    }

    this.cerrando.set(true);
    this.errorGestion.set(null);

    this.api
      .cerrar(actual.id)
      .pipe(finalize(() => this.cerrando.set(false)))
      .subscribe({
        next: () => this.cargar(),
        error: (error: HttpErrorResponse) => this.errorGestion.set(mensajeError(error, 'No pudimos cerrar el ticket.')),
      });
  }

  protected descargar(adjunto: Adjunto): void {
    const actual = this.ticket();
    if (!actual) {
      return;
    }

    this.api.descargar(actual.id, adjunto).subscribe({
      next: (contenido: Blob) => {
        const url = URL.createObjectURL(contenido);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = adjunto.nombre;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (error: HttpErrorResponse) => this.errorRespuesta.set(mensajeError(error, 'No pudimos descargar el archivo.')),
    });
  }

  protected describir(registro: RegistroHistorial): string {
    const detalle = registro.detalle;

    if (registro.accion === 'ticket_estado' && detalle) {
      return `${etiquetaEstadoTicket(String(detalle['de']) as EstadoTicket)} → ${etiquetaEstadoTicket(String(detalle['a']) as EstadoTicket)}`;
    }

    if (registro.accion === 'ticket_asignado' && detalle) {
      const id = detalle['usuario_id'];
      if (id === null) {
        return 'Sin responsable';
      }
      const usuario = this.administradores().find((item: Usuario) => item.id === Number(id));
      return usuario ? `Asignado a ${usuario.nombre}` : 'Asignado a otro usuario';
    }

    return '';
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api.ver(this.id()).subscribe({
      next: (detalle: DetalleTicket) => {
        this.ticket.set(detalle.ticket);
        this.mensajes.set(detalle.mensajes);
        this.historial.set(detalle.historial);
        this.estado = detalle.ticket.estado;
        this.prioridad = detalle.ticket.prioridad;
        this.asignadoA = detalle.ticket.asignado ? String(detalle.ticket.asignado.id) : '';
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.status === 404 || error.status === 403 ? 'Este ticket no existe o no tienes acceso.' : mensajeError(error, 'No pudimos cargar el ticket.'),
        );
        this.cargando.set(false);
      },
    });
  }
}
