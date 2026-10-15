import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SystemDemoComponent } from '../system-demo/system-demo.component';

@Component({
  selector: 'app-demo-section',
  standalone: true,
  imports: [RouterLink, SystemDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo-section.component.html',
  styleUrl: './demo-section.component.css',
})
export class DemoSectionComponent {
  readonly sistema = input.required<'pro8' | 'mozo4' | 'agente'>();
  readonly nombre = input.required<string>();
}
