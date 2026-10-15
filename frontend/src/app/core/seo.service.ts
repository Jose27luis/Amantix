import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export const SITIO_URL = 'https://amantix.pe';
export const SITIO_NOMBRE = 'Amantix';
const IMAGEN_POR_DEFECTO = `${SITIO_URL}/amantix-marca.png`;

export interface DatosSeo {
  readonly titulo: string;
  readonly descripcion: string;
  readonly ruta: string;
  readonly imagen?: string;
  readonly imagenAncho?: number;
  readonly imagenAlto?: number;
  readonly tipo?: 'website' | 'article';
  readonly publicado?: string | null;
  readonly modificado?: string | null;
  readonly indexar?: boolean;
  readonly datosEstructurados?: Readonly<Record<string, unknown>> | null;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titulo = inject(Title);
  private readonly meta = inject(Meta);
  private readonly documento = inject(DOCUMENT);

  aplicar(datos: DatosSeo): void {
    const url = SITIO_URL + (datos.ruta === '/' ? '/' : datos.ruta);
    const imagen = datos.imagen ? (datos.imagen.startsWith('http') ? datos.imagen : SITIO_URL + datos.imagen) : IMAGEN_POR_DEFECTO;
    const tituloCompleto = datos.ruta === '/' ? datos.titulo : `${datos.titulo} · ${SITIO_NOMBRE}`;

    this.titulo.setTitle(tituloCompleto);
    this.nombre('description', datos.descripcion);
    this.nombre('robots', datos.indexar === false ? 'noindex, follow' : 'index, follow, max-image-preview:large');

    this.propiedad('og:site_name', SITIO_NOMBRE);
    this.propiedad('og:locale', 'es_PE');
    this.propiedad('og:type', datos.tipo ?? 'website');
    this.propiedad('og:title', datos.titulo);
    this.propiedad('og:description', datos.descripcion);
    this.propiedad('og:url', url);
    this.propiedad('og:image', imagen);
    this.propiedad('og:image:alt', datos.titulo);
    this.opcional('og:image:width', datos.imagenAncho ?? (datos.imagen ? undefined : 1200));
    this.opcional('og:image:height', datos.imagenAlto ?? (datos.imagen ? undefined : 670));
    this.opcionalPropiedad('article:published_time', datos.publicado ?? undefined);
    this.opcionalPropiedad('article:modified_time', datos.modificado ?? undefined);

    this.nombre('twitter:card', 'summary_large_image');
    this.nombre('twitter:title', datos.titulo);
    this.nombre('twitter:description', datos.descripcion);
    this.nombre('twitter:image', imagen);

    this.canonica(url);
    this.estructurados(datos.datosEstructurados ?? null);
  }

  private nombre(nombre: string, contenido: string): void {
    this.meta.updateTag({ name: nombre, content: contenido });
  }

  private propiedad(propiedad: string, contenido: string): void {
    this.meta.updateTag({ property: propiedad, content: contenido });
  }

  private opcional(propiedad: string, valor: number | undefined): void {
    if (valor === undefined) {
      this.meta.removeTag(`property="${propiedad}"`);
      return;
    }
    this.propiedad(propiedad, String(valor));
  }

  private opcionalPropiedad(propiedad: string, valor: string | undefined): void {
    if (valor === undefined) {
      this.meta.removeTag(`property="${propiedad}"`);
      return;
    }
    this.propiedad(propiedad, valor);
  }

  private canonica(url: string): void {
    let enlace = this.documento.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!enlace) {
      enlace = this.documento.createElement('link');
      enlace.setAttribute('rel', 'canonical');
      this.documento.head.appendChild(enlace);
    }

    enlace.setAttribute('href', url);
  }

  private estructurados(datos: Readonly<Record<string, unknown>> | null): void {
    const existente = this.documento.head.querySelector('script[data-seo="pagina"]');
    existente?.remove();

    if (datos === null) {
      return;
    }

    const script = this.documento.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo', 'pagina');
    script.textContent = JSON.stringify(datos).replace(/</g, '\\u003c');
    this.documento.head.appendChild(script);
  }
}
