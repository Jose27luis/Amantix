import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { SessionService } from '../core/session.service';
import { LeadsApiService } from '../services/leads-api.service';

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
  protected readonly sesion = inject(SessionService);
  protected readonly leads = inject(LeadsApiService);

  protected readonly menuAbierto = signal(false);

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });

    if (this.sesion.esAdministrador()) {
      this.leads.refrescarPendientes();
    }
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto: boolean) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected salir(): void {
    this.sesion.salir().subscribe(() => this.router.navigate(['/panel/login']));
  }
}
