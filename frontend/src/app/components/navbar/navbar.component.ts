import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../panel/core/session.service';
import { PAGINAS_LOCALES } from '../../data/local-pages';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  host: {
    '(document:click)': 'clicFuera($event)',
    '(document:keydown.escape)': 'cerrarSoluciones()',
  },
})
export class NavbarComponent {
  private readonly sesion = inject(SessionService);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly soluciones = PAGINAS_LOCALES;
  protected readonly menuOpen = signal(false);
  protected readonly solucionesAbierto = signal(false);
  protected readonly conSesion = computed(() => this.sesion.token() !== null);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.solucionesAbierto.set(false);
  }

  protected alternarSoluciones(): void {
    this.solucionesAbierto.update((abierto: boolean) => !abierto);
  }

  protected cerrarSoluciones(): void {
    this.solucionesAbierto.set(false);
  }

  protected clicFuera(evento: MouseEvent): void {
    const destino = evento.target;
    if (destino instanceof Node && !this.elemento.nativeElement.querySelector('.drop')?.contains(destino)) {
      this.solucionesAbierto.set(false);
    }
  }
}
