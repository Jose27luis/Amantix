import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-share-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './share-button.component.html',
  styleUrl: './share-button.component.css',
})
export class ShareButtonComponent {
  readonly url = input.required<string>();
  readonly titulo = input.required<string>();
  readonly texto = input('');
  readonly etiqueta = input('Compartir');
  readonly claro = input(false);

  protected readonly copiado = signal(false);

  protected async compartir(evento: Event): Promise<void> {
    evento.preventDefault();
    evento.stopPropagation();

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: this.titulo(), text: this.texto() || this.titulo(), url: this.url() });
        return;
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(this.url());
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2200);
    } catch {
      this.copiado.set(false);
    }
  }
}
