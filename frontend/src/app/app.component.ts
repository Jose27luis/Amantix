import { afterNextRender, ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { WhatsappButtonComponent } from './components/whatsapp-button/whatsapp-button.component';
import { SocialFollowComponent } from './components/social-follow/social-follow.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, WhatsappButtonComponent, SocialFollowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private observer: IntersectionObserver | null = null;
  private readonly observed = new WeakSet<Element>();

  protected readonly esPanel = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects.startsWith('/panel')),
    ),
    { initialValue: inject(Location).path().startsWith('/panel') },
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      document.documentElement.classList.add('js-reveal');
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle('reveal-visible', entry.isIntersecting);
          }
        },
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
      );
      this.scan();
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => this.scan()));
    });
  }

  private scan(): void {
    if (!this.observer) {
      return;
    }
    document.querySelectorAll('.reveal').forEach((element) => {
      if (!this.observed.has(element)) {
        this.observed.add(element);
        this.observer?.observe(element);
      }
    });
  }
}
