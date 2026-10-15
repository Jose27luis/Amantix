import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Noticia } from '../../news/news.models';
import { fechaNoticia } from '../../news/news-text';
import { SITIO_URL } from '../../core/seo.service';
import { ShareButtonComponent } from '../share-button/share-button.component';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink, ShareButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.css',
})
export class NewsCardComponent {
  readonly noticia = input.required<Noticia>();
  readonly prioridad = input(false);

  protected readonly fecha = computed(() => fechaNoticia(this.noticia().publicada_en));
  protected readonly url = computed(() => `${SITIO_URL}/noticias/${this.noticia().slug}`);
}
