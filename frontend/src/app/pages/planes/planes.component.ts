import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

type BillingPeriod = 'mensual' | 'anual';

interface Plan {
  readonly name: string;
  readonly monthly: number;
  readonly description: string;
  readonly features: readonly string[];
  readonly highlighted: boolean;
}

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planes.component.html',
  styleUrl: './planes.component.css',
})
export class PlanesComponent {
  protected readonly period = signal<BillingPeriod>('mensual');

  constructor() {
    inject(SeoService).aplicar({
      titulo: 'Planes y precios desde S/ 80 al mes',
      descripcion:
        'Planes Esencial, Negocio y Corporativo para facturación electrónica SUNAT, restaurantes y agentes multibancarios. Desde S/ 80 al mes con soporte por WhatsApp.',
      ruta: '/planes',
    });
  }

  protected readonly plans: readonly Plan[] = [
    {
      name: 'Esencial',
      monthly: 80,
      description: 'Para empezar a facturar y operar con un solo sistema.',
      features: ['Un sistema a elección', 'Multi-tenant por RUC', 'Comprobantes SUNAT', 'Soporte por WhatsApp'],
      highlighted: false,
    },
    {
      name: 'Negocio',
      monthly: 100,
      description: 'Para negocios en crecimiento que combinan sistemas.',
      features: [
        'Hasta dos sistemas',
        'SIRE y reportes',
        'Capacitación inicial',
        'Soporte prioritario',
        'Cierre de caja diario',
      ],
      highlighted: true,
    },
    {
      name: 'Corporativo',
      monthly: 120,
      description: 'Para operaciones grandes con varios locales.',
      features: [
        'Los tres sistemas',
        'Multi-local',
        'Integraciones a medida',
        'Acompañamiento dedicado',
        'Auditoría de seguridad',
      ],
      highlighted: false,
    },
  ];

  protected readonly priceLabel = computed<(plan: Plan) => string>(() => {
    const isAnnual = this.period() === 'anual';
    return (plan: Plan): string => {
      const value = isAnnual ? plan.monthly * 10 : plan.monthly;
      return `S/ ${value}`;
    };
  });

  protected setPeriod(value: BillingPeriod): void {
    this.period.set(value);
  }
}
