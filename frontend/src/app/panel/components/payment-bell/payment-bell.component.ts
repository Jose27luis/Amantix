import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BillingApiService, PagosPendientes } from '../../services/billing-api.service';
import { PagoReportado } from '../../models/panel.models';
import { formatoSoles } from '../../models/labels';

const INTERVALO_MS = 120000;

@Component({
  selector: 'app-payment-bell',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-bell.component.html',
  styleUrl: './payment-bell.component.css',
})
export class PaymentBellComponent {
  private readonly api = inject(BillingApiService);

  protected readonly total = this.api.pagosEnRevision;
  protected readonly ultimos = signal<readonly PagoReportado[]>([]);
  protected readonly abierto = signal(false);
  protected readonly formatoSoles = formatoSoles;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    this.cargar();
    const intervalo = setInterval(() => this.cargar(), INTERVALO_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalo));
  }

  protected alternar(): void {
    this.abierto.update((valor: boolean) => !valor);
    if (this.abierto()) {
      this.cargar();
    }
  }

  protected cerrar(): void {
    this.abierto.set(false);
  }

  private cargar(): void {
    this.api.pendientes().subscribe({
      next: (respuesta: PagosPendientes) => this.ultimos.set(respuesta.data),
      error: () => undefined,
    });
  }
}
