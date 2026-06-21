import { Injectable, signal } from '@angular/core';
import { Lead, LeadReceipt } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly receiptSignal = signal<LeadReceipt | null>(null);

  readonly receipt = this.receiptSignal.asReadonly();

  register(lead: Lead): LeadReceipt {
    const receipt: LeadReceipt = {
      registration: this.buildRegistration(),
      productLabel: lead.productInterest,
      source: 'Formulario de contacto',
    };
    this.receiptSignal.set(receipt);
    return receipt;
  }

  clear(): void {
    this.receiptSignal.set(null);
  }

  private buildRegistration(): string {
    const stamp = Date.now().toString(36).toUpperCase().slice(-6);
    return `AMX-${stamp}`;
  }
}
