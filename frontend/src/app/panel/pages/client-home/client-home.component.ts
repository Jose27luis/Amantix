import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TicketsApiService } from '../../services/tickets-api.service';
import { SessionService } from '../../core/session.service';
import { ResumenCliente } from '../../models/panel.models';
import {
  etiquetaEstadoSuscripcion,
  etiquetaEstadoTicket,
  fechaCorta,
  formatoSoles,
  mensajeError,
} from '../../models/labels';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-home.component.html',
  styleUrls: ['../../panel-shared.css', './client-home.component.css'],
})
export class ClientHomeComponent {
  private readonly api = inject(TicketsApiService);
  protected readonly sesion = inject(SessionService);

  protected readonly etiquetaEstadoSuscripcion = etiquetaEstadoSuscripcion;
  protected readonly etiquetaEstadoTicket = etiquetaEstadoTicket;
  protected readonly fechaCorta = fechaCorta;
  protected readonly formatoSoles = formatoSoles;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resumen = signal<ResumenCliente | null>(null);

  constructor() {
    this.api.resumenCliente().subscribe({
      next: (resumen: ResumenCliente) => {
        this.resumen.set(resumen);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar tu resumen.'));
        this.cargando.set(false);
      },
    });
  }
}
