import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillingPeriod, MESES_COBRADOS_AL_ANIO, PLANES, Plan, precioPlan } from '../../data/plans';

type Rubro = 'tienda' | 'restaurante' | 'agente' | 'farmacia' | 'hotel';

interface OpcionRubro {
  readonly valor: Rubro;
  readonly etiqueta: string;
  readonly sistemas: readonly string[];
}

const RUBROS: readonly OpcionRubro[] = [
  { valor: 'tienda', etiqueta: 'Tienda o bodega', sistemas: ['Facturador Amantix'] },
  { valor: 'restaurante', etiqueta: 'Restaurante', sistemas: ['Restaurant Sumaqta'] },
  { valor: 'agente', etiqueta: 'Agente bancario', sistemas: ['Agente Amantix'] },
  { valor: 'farmacia', etiqueta: 'Farmacia o botica', sistemas: ['Facturador Amantix'] },
  { valor: 'hotel', etiqueta: 'Hotel u hospedaje', sistemas: ['Facturador Amantix'] },
];

@Component({
  selector: 'app-plan-advisor',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-advisor.component.html',
  styleUrl: './plan-advisor.component.css',
})
export class PlanAdvisorComponent {
  protected readonly rubros = RUBROS;
  protected readonly cantidades = [1, 2, 3];

  protected readonly rubro = signal<Rubro>('tienda');
  protected readonly sistemas = signal(1);
  protected readonly variosLocales = signal(false);
  protected readonly periodo = signal<BillingPeriod>('mensual');

  protected readonly plan = computed((): Plan => {
    const necesarios = this.sistemas();
    const multiLocal = this.variosLocales();
    return PLANES.find((plan: Plan) => plan.sistemas >= necesarios && (!multiLocal || plan.multiLocal)) ?? PLANES[PLANES.length - 1];
  });

  protected readonly precio = computed(() => precioPlan(this.plan(), this.periodo()));
  protected readonly ahorro = computed(() => this.plan().monthly * (12 - MESES_COBRADOS_AL_ANIO));
  protected readonly costoAnualMensual = computed(() => this.plan().monthly * 12);
  protected readonly costoAnual = computed(() => this.plan().monthly * MESES_COBRADOS_AL_ANIO);
  protected readonly proporcionAnual = computed(() => (this.costoAnual() / this.costoAnualMensual()) * 100);

  protected readonly sugerencia = computed((): string => {
    const base = RUBROS.find((item: OpcionRubro) => item.valor === this.rubro())?.sistemas[0] ?? 'Facturador Amantix';
    if (this.sistemas() === 1) {
      return `Te recomendamos ${base}.`;
    }
    return `${base} y ${this.sistemas() === 2 ? 'un sistema más' : 'los demás sistemas de Amantix'}, en una sola cuenta.`;
  });

  protected readonly mensajeWhatsapp = computed(
    () =>
      `https://wa.me/51931110735?text=${encodeURIComponent(
        `Hola, me interesa el plan ${this.plan().name} (${this.periodo()}) para mi ${RUBROS.find((item) => item.valor === this.rubro())?.etiqueta.toLowerCase() ?? 'negocio'}.`,
      )}`,
  );
}
