import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-news-share',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-share.component.html',
  styleUrl: './news-share.component.css',
})
export class NewsShareComponent {
  readonly url = input.required<string>();
  readonly titulo = input.required<string>();

  protected readonly copiado = signal(false);

  protected readonly whatsapp = computed(() => `https://wa.me/?text=${encodeURIComponent(`${this.titulo()}\n${this.url()}`)}`);
  protected readonly facebook = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url())}`);
  protected readonly linkedin = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.url())}`);

  protected copiar(): void {
    navigator.clipboard.writeText(this.url()).then(
      () => {
        this.copiado.set(true);
        setTimeout(() => this.copiado.set(false), 2200);
      },
      () => this.copiado.set(false),
    );
  }
}
