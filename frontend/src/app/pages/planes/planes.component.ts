import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { BillingPeriod, PLANES, Plan, precioPlan } from '../../data/plans';
import { PlanAdvisorComponent } from '../../components/plan-advisor/plan-advisor.component';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [RouterLink, PlanAdvisorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planes.component.html',
  styleUrl: './planes.component.css',
})
export class PlanesComponent {
  protected readonly period = signal<BillingPeriod>('mensual');
  protected readonly plans: readonly Plan[] = PLANES;

  constructor() {
    inject(SeoService).aplicar({
      titulo: 'Planes y precios desde S/ 80 al mes',
      descripcion:
        'Planes Esencial, Negocio y Corporativo para facturación electrónica SUNAT, restaurantes y agentes multibancarios. Desde S/ 80 al mes con soporte por WhatsApp.',
      ruta: '/planes',
    });
  }

  protected readonly priceLabel = computed<(plan: Plan) => string>(() => {
    const periodo = this.period();
    return (plan: Plan): string => `S/ ${precioPlan(plan, periodo)}`;
  });

  protected setPeriod(value: BillingPeriod): void {
    this.period.set(value);
  }
}
