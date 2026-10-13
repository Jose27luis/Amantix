import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { SessionService } from '../core/session.service';
import { LeadsApiService } from '../services/leads-api.service';
import { TicketsApiService } from '../services/tickets-api.service';

const CLAVE_COLAPSO = 'amantix.panel.sidebar';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-layout.component.html',
  styleUrl: './panel-layout.component.css',
})
export class PanelLayoutComponent {
  private readonly router = inject(Router);
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly sesion = inject(SessionService);
  protected readonly leads = inject(LeadsApiService);
  protected readonly tickets = inject(TicketsApiService);

  protected readonly menuAbierto = signal(false);
  protected readonly colapsado = signal(this.leerPreferencia());

  protected readonly iniciales = computed((): string => {
    const partes = (this.sesion.usuario()?.nombre ?? '').trim().split(/\s+/).filter((parte: string) => parte !== '');
    return partes
      .slice(0, 2)
      .map((parte: string) => parte.charAt(0).toUpperCase())
      .join('');
  });

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });

    if (this.sesion.esAdministrador()) {
      this.leads.refrescarPendientes();
      this.tickets.refrescarPendientes();
    }
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto: boolean) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected alternarColapso(): void {
    const nuevo = !this.colapsado();
    this.colapsado.set(nuevo);

    if (this.esNavegador) {
      try {
        localStorage.setItem(CLAVE_COLAPSO, nuevo ? '1' : '0');
      } catch {
        return;
      }
    }
  }

  private leerPreferencia(): boolean {
    if (!this.esNavegador) {
      return false;
    }

    try {
      return localStorage.getItem(CLAVE_COLAPSO) === '1';
    } catch {
      return false;
    }
  }

  protected salir(): void {
    this.sesion.salir().subscribe(() => this.router.navigate(['/panel/login']));
  }
}
