import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { SITIO_URL } from '../../../core/seo.service';
import { REDES_SOCIALES } from '../../../core/social';

const PAGINA_FACEBOOK = REDES_SOCIALES.find((perfil) => perfil.red === 'facebook')?.url;

type Red = 'facebook' | 'linkedin';

const LIMITE: Readonly<Record<Red, number>> = { facebook: 60000, linkedin: 3000 };
const CIERRE = 'Lee la nota completa en nuestra web:';

function recortar(contenido: string, disponible: number): string {
  if (contenido.length <= disponible) {
    return contenido;
  }

  const elegidos: string[] = [];
  let largo = 0;

  for (const parrafo of contenido.split(/\n{2,}/u)) {
    const extra = (elegidos.length === 0 ? 0 : 2) + parrafo.length;
    if (largo + extra > disponible) {
      break;
    }
    elegidos.push(parrafo);
    largo += extra;
  }

  return elegidos.length === 0 ? `${contenido.slice(0, Math.max(0, disponible - 1)).trimEnd()}…` : `${elegidos.join('\n\n')}\n\n…`;
}

@Component({
  selector: 'app-social-publish',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './social-publish.component.html',
  styleUrl: './social-publish.component.css',
})
export class SocialPublishComponent {
  readonly titulo = input.required<string>();
  readonly contenido = input.required<string>();
  readonly slug = input.required<string>();

  protected readonly aviso = signal<string | null>(null);

  protected readonly url = computed(() => `${SITIO_URL}/noticias/${this.slug()}`);
  protected readonly enlaceFacebook = computed(
    () => PAGINA_FACEBOOK ?? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url())}`,
  );
  protected readonly enlaceLinkedin = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.url())}`);
  protected readonly recortaLinkedin = computed(() => this.texto('linkedin').length < this.texto('facebook').length);

  protected copiar(red: Red | null): void {
    navigator.clipboard.writeText(this.texto(red ?? 'facebook')).then(
      () => {
        this.aviso.set(
          red === null
            ? 'Texto copiado.'
            : red === 'facebook'
              ? 'Texto copiado. En la página de Facebook pulsa «Escribe algo», pega con Ctrl+V y publica; la vista previa con la imagen se arma sola con el enlace.'
              : 'Texto copiado. Pégalo con Ctrl+V en la ventana de LinkedIn.',
        );
        setTimeout(() => this.aviso.set(null), 9000);
      },
      () => this.aviso.set('El navegador no dejó copiar. Pulsa «Copiar texto» y vuelve a intentarlo.'),
    );
  }

  private texto(red: Red): string {
    const encabezado = `${this.titulo().trim()}\n\n`;
    const final = `${CIERRE}\n${this.url()}`;
    const disponible = LIMITE[red] - encabezado.length - final.length - 4;

    return `${encabezado}${recortar(this.contenido().trim(), disponible)}\n\n${final}`;
  }
}
