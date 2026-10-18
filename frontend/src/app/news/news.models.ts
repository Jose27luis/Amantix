export type EstadoNoticia = 'borrador' | 'publicada';

export interface ImagenNoticia {
  readonly url: string;
  readonly ancho: number;
  readonly alto: number;
}

export interface Noticia {
  readonly id: number;
  readonly slug: string;
  readonly titulo: string;
  readonly resumen: string;
  readonly contenido?: string;
  readonly imagen: ImagenNoticia;
  readonly imagen_compartir: ImagenNoticia;
  readonly estado: EstadoNoticia;
  readonly publicada_en: string | null;
  readonly actualizada_en: string | null;
  readonly autor: string | null;
}

export interface PaginaNoticias {
  readonly data: readonly Noticia[];
  readonly meta: {
    readonly current_page: number;
    readonly last_page: number;
    readonly total: number;
  };
}

export interface DetalleNoticia {
  readonly noticia: Noticia;
  readonly relacionadas: readonly Noticia[];
}

export type Segmento =
  | { readonly tipo: 'texto'; readonly valor: string }
  | { readonly tipo: 'negrita'; readonly valor: string }
  | { readonly tipo: 'enlace'; readonly valor: string; readonly href: string };

export type Bloque =
  | { readonly tipo: 'parrafo'; readonly segmentos: readonly Segmento[] }
  | { readonly tipo: 'subtitulo'; readonly segmentos: readonly Segmento[] }
  | { readonly tipo: 'lista'; readonly ordenada: boolean; readonly items: readonly (readonly Segmento[])[] };
