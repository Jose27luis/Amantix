import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RedSocial } from '../../core/social';

@Component({
  selector: 'app-social-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './social-icon.component.html',
  styles: [':host { display: inline-flex; line-height: 0; }'],
})
export class SocialIconComponent {
  readonly red = input.required<RedSocial | 'whatsapp' | 'linkedin'>();
  readonly tamano = input(18);
}
