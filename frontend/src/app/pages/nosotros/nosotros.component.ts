import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

interface Value {
  readonly title: string;
  readonly description: string;
}

interface Fact {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css',
})
export class NosotrosComponent {
  constructor() {
    inject(SeoService).aplicar({
      titulo: 'Nosotros: casa de software de Puerto Maldonado',
      descripcion:
        'Amantix nació en Puerto Maldonado para crear sistemas que cuadren, cumplan con SUNAT y no fallen cuando hay dinero de por medio.',
      ruta: '/nosotros',
    });
  }

  protected readonly values: readonly Value[] = [
    { title: 'Precisión', description: 'Si maneja dinero o impuestos, tiene que cuadrar siempre.' },
    { title: 'Seguridad', description: 'Aislamiento por empresa, cifrado y trazabilidad por defecto.' },
    { title: 'Cercanía', description: 'Soporte real, en tu idioma, cuando lo necesitas.' },
  ];

  protected readonly facts: readonly Fact[] = [
    { label: 'Fundación', value: '2026' },
    { label: 'Sistemas', value: '03' },
    { label: 'Sede', value: 'Pto. Maldonado' },
    { label: 'Conexión', value: 'SUNAT' },
  ];
}
