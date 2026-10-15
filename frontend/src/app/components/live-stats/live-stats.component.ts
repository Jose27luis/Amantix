import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { CifrasPublicas, SiteContentService } from '../../core/site-content.service';

interface Cifra {
  readonly valor: number;
  readonly etiqueta: string;
  readonly detalle: string;
}

const MINIMOS: Readonly<Record<keyof CifrasPublicas, number>> = {
  sistemas: 1,
  empresas: 5,
  noticias: 3,
  tickets_resueltos: 10,
};

@Component({
  selector: 'app-live-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-stats.component.html',
  styleUrl: './live-stats.component.css',
})
export class LiveStatsComponent {
  private readonly datos = toSignal(inject(SiteContentService).cifras().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  protected readonly cifras = computed((): readonly Cifra[] => {
    const datos = this.datos();
    if (!datos) {
      return [];
    }

    const candidatas: readonly (Cifra & { readonly clave: keyof CifrasPublicas })[] = [
      { clave: 'sistemas', valor: datos.sistemas, etiqueta: 'sistemas en producción', detalle: 'Facturación, restaurantes y agentes bancarios' },
      { clave: 'empresas', valor: datos.empresas, etiqueta: 'empresas confían en Amantix', detalle: 'Con su suscripción activa hoy' },
      { clave: 'noticias', valor: datos.noticias, etiqueta: 'guías y noticias publicadas', detalle: 'Para que tu negocio esté al día con SUNAT' },
      { clave: 'tickets_resueltos', valor: datos.tickets_resueltos, etiqueta: 'consultas de soporte resueltas', detalle: 'Atendidas por nuestro equipo' },
    ];

    return candidatas.filter((cifra) => cifra.valor >= MINIMOS[cifra.clave]);
  });
}
