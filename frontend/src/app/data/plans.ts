export type BillingPeriod = 'mensual' | 'anual';

export interface Plan {
  readonly name: string;
  readonly monthly: number;
  readonly description: string;
  readonly features: readonly string[];
  readonly highlighted: boolean;
  readonly sistemas: number;
  readonly multiLocal: boolean;
}

export const MESES_COBRADOS_AL_ANIO = 10;

export const PLANES: readonly Plan[] = [
  {
    name: 'Esencial',
    monthly: 80,
    description: 'Para empezar a facturar y operar con un solo sistema.',
    features: ['Un sistema a elección', 'Multi-tenant por RUC', 'Comprobantes SUNAT', 'Soporte por WhatsApp'],
    highlighted: false,
    sistemas: 1,
    multiLocal: false,
  },
  {
    name: 'Negocio',
    monthly: 100,
    description: 'Para negocios en crecimiento que combinan sistemas.',
    features: ['Hasta dos sistemas', 'SIRE y reportes', 'Capacitación inicial', 'Soporte prioritario', 'Cierre de caja diario'],
    highlighted: true,
    sistemas: 2,
    multiLocal: false,
  },
  {
    name: 'Corporativo',
    monthly: 120,
    description: 'Para operaciones grandes con varios locales.',
    features: ['Los tres sistemas', 'Multi-local', 'Integraciones a medida', 'Acompañamiento dedicado', 'Auditoría de seguridad'],
    highlighted: false,
    sistemas: 3,
    multiLocal: true,
  },
];

export function precioPlan(plan: Plan, periodo: BillingPeriod): number {
  return periodo === 'anual' ? plan.monthly * MESES_COBRADOS_AL_ANIO : plan.monthly;
}
