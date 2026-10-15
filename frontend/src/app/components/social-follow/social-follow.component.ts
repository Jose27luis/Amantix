import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { REDES_SOCIALES } from '../../core/social';
import { SocialIconComponent } from '../social-icon/social-icon.component';

@Component({
  selector: 'app-social-follow',
  standalone: true,
  imports: [SocialIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './social-follow.component.html',
  styleUrl: './social-follow.component.css',
})
export class SocialFollowComponent {
  readonly variante = input<'franja' | 'tarjeta'>('franja');

  protected readonly redes = REDES_SOCIALES;
}
