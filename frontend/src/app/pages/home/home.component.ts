import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRODUCTS } from '../../data/products';
import { SeoService } from '../../core/seo.service';
import { LocalSolutionsComponent } from '../../components/local-solutions/local-solutions.component';

interface Pillar {
  readonly code: string;
  readonly title: string;
  readonly description: string;
}

interface SecurityControl {
  readonly tag: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LocalSolutionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly products = PRODUCTS;

  constructor() {
    inject(SeoService).aplicar({
      titulo: 'Amantix — Software empresarial para facturar, operar y controlar',
      descripcion:
        'Casa de software peruana: facturación electrónica SUNAT, sistema para restaurantes y agente multibancario. Soporte cercano desde Puerto Maldonado.',
      ruta: '/',
    });
  }

  protected readonly badges: readonly string[] = ['SUNAT', 'EN PRODUCCIÓN', 'HTTPS · SSL', 'MULTI-TENANT'];

  protected readonly pillars: readonly Pillar[] = [
    {
      code: '01 · AISLAMIENTO',
      title: 'Multi-tenant real',
      description: 'Cada empresa con su propio RUC y base de datos aislada. Sin cruces.',
    },
    {
      code: '02 · SUNAT',
      title: 'Conectado al ente',
      description: 'Comprobantes, GRE y SIRE válidos ante SUNAT, integrados en cada flujo.',
    },
    {
      code: '03 · DINERO',
      title: 'Cuadra al centavo',
      description: 'Caja, billeteras y cierre diario pensados para no perder un sol.',
    },
    {
      code: '04 · SOPORTE',
      title: 'Cerca de ti',
      description: 'Acompañamiento por WhatsApp y capacitación para tu equipo.',
    },
  ];

  protected readonly controls: readonly SecurityControl[] = [
    {
      tag: '01',
      title: 'Minimización de datos',
      description: 'Los formularios piden solo lo necesario para responderte.',
    },
    {
      tag: '02',
      title: 'Consentimiento y propósito',
      description: 'Usamos tus datos únicamente para atender tu solicitud.',
    },
    {
      tag: '03',
      title: 'Trazabilidad',
      description: 'Cada lead se registra con fecha y origen. Control, no exposición.',
    },
    {
      tag: '04',
      title: 'Datos protegidos',
      description: 'Conexión cifrada de extremo a extremo en cada envío.',
    },
  ];
}
