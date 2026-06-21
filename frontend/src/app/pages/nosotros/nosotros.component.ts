import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  protected readonly values: readonly Value[] = [
    { title: 'Precisión', description: 'Si maneja dinero o impuestos, tiene que cuadrar siempre.' },
    { title: 'Seguridad', description: 'Aislamiento por empresa, cifrado y trazabilidad por defecto.' },
    { title: 'Cercanía', description: 'Soporte real, en tu idioma, cuando lo necesitas.' },
  ];

  protected readonly facts: readonly Fact[] = [
    { label: 'Fundación', value: '2026' },
    { label: 'Sistemas', value: '03' },
    { label: 'Sede', value: 'Pto. Maldonado' },
    { label: 'Reg.', value: 'ISO 27001' },
  ];
}
