import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Lead, LeadCreatedResponse, LeadPayload, LeadReceipt } from '../models/lead.model';

export const UNDECIDED_PRODUCT = 'sin-definir';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly receiptSignal = signal<LeadReceipt | null>(null);

  readonly receipt = this.receiptSignal.asReadonly();

  register(lead: Lead): Observable<LeadReceipt> {
    return this.http.post<LeadCreatedResponse>('/api/leads', this.toPayload(lead)).pipe(
      map((respuesta: LeadCreatedResponse): LeadReceipt => ({
        registration: respuesta.codigo,
        productLabel: respuesta.producto ?? 'Aún por definir',
        source: 'Formulario de contacto',
      })),
      tap((receipt: LeadReceipt) => this.receiptSignal.set(receipt)),
    );
  }

  clear(): void {
    this.receiptSignal.set(null);
  }

  private toPayload(lead: Lead): LeadPayload {
    const texto = (valor: string): string | null => (valor.trim() === '' ? null : valor.trim());

    return {
      nombre: lead.name.trim(),
      empresa: texto(lead.company),
      correo: lead.email.trim(),
      telefono: texto(lead.phone),
      producto: lead.productInterest === UNDECIDED_PRODUCT ? null : lead.productInterest,
      mensaje: lead.message.trim(),
      origen: 'contacto',
      sitio_web: lead.website,
    };
  }
}
