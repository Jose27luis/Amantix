import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TicketsApiService } from '../../services/tickets-api.service';
import { CatalogApiService } from '../../services/catalog-api.service';
import { PrioridadTicket, ProductoResumen, Ticket } from '../../models/panel.models';
import { PRIORIDADES_TICKET, mensajeError } from '../../models/labels';
import { FilePickerComponent } from '../../components/file-picker/file-picker.component';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FilePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-new.component.html',
  styleUrls: ['../../panel-shared.css', './ticket-new.component.css'],
})
export class TicketNewComponent {
  private readonly api = inject(TicketsApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly productos = toSignal(inject(CatalogApiService).productos$, {
    initialValue: [] as readonly ProductoResumen[],
  });
  protected readonly prioridades = PRIORIDADES_TICKET;

  protected readonly archivos = signal<readonly File[]>([]);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    producto_id: [''],
    asunto: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(160)]],
    prioridad: ['media' as PrioridadTicket, [Validators.required]],
    mensaje: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(5000)]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.enviando()) {
      return;
    }

    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);

    this.api
      .abrir(
        { producto_id: valores.producto_id, asunto: valores.asunto.trim(), prioridad: valores.prioridad, mensaje: valores.mensaje.trim() },
        this.archivos(),
      )
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (ticket: Ticket) => this.router.navigate(['/panel/tickets', ticket.id]),
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos crear el ticket.')),
      });
  }

  protected invalido(control: 'asunto' | 'mensaje'): boolean {
    const campo = this.form.controls[control];
    return campo.invalid && campo.touched;
  }
}
