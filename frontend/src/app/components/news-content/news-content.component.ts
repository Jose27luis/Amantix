import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { interpretar } from '../../news/news-text';
import { Bloque } from '../../news/news.models';

@Component({
  selector: 'app-news-content',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-content.component.html',
  styleUrl: './news-content.component.css',
})
export class NewsContentComponent {
  readonly contenido = input.required<string>();

  protected readonly bloques = computed((): readonly Bloque[] => interpretar(this.contenido()));
}
