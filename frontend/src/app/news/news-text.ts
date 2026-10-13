import { Bloque, Segmento } from './news.models';

const VINETA = /^(?:[-•*▪▫◦➤►→✓✔✅☑🔹🔸🔷🔶👉📌]|\p{Extended_Pictographic})️?\s+/u;
const NUMERADA = /^\d{1,2}[.)]\s+/u;
const ENLACE = /(https?:\/\/[^\s<>"']+)/u;
const NEGRITA = /\*\*(.+?)\*\*/u;
const LARGO_SUBTITULO = 80;

export function segmentar(texto: string): readonly Segmento[] {
  const segmentos: Segmento[] = [];
  let resto = texto;

  while (resto.length > 0) {
    const enlace = ENLACE.exec(resto);
    const negrita = NEGRITA.exec(resto);
    const siguiente = [enlace, negrita]
      .filter((coincidencia): coincidencia is RegExpExecArray => coincidencia !== null)
      .sort((a, b) => a.index - b.index)[0];

    if (!siguiente) {
      segmentos.push({ tipo: 'texto', valor: resto });
      break;
    }

    if (siguiente.index > 0) {
      segmentos.push({ tipo: 'texto', valor: resto.slice(0, siguiente.index) });
    }

    if (siguiente === negrita) {
      segmentos.push({ tipo: 'negrita', valor: siguiente[1] });
      resto = resto.slice(siguiente.index + siguiente[0].length);
      continue;
    }

    const crudo = siguiente[1];
    const limpio = crudo.replace(/[.,;:!?)\]]+$/u, '');
    segmentos.push({ tipo: 'enlace', valor: limpio, href: limpio });
    resto = crudo.slice(limpio.length) + resto.slice(siguiente.index + crudo.length);
  }

  return segmentos;
}

function esSubtitulo(linea: string): boolean {
  return linea.length <= LARGO_SUBTITULO && /[:?]$/u.test(linea) && !/^https?:/u.test(linea);
}

export function interpretar(contenido: string): readonly Bloque[] {
  const bloques: Bloque[] = [];
  let lista: { ordenada: boolean; items: (readonly Segmento[])[] } | null = null;

  const cerrarLista = (): void => {
    if (lista !== null) {
      bloques.push({ tipo: 'lista', ordenada: lista.ordenada, items: lista.items });
      lista = null;
    }
  };

  for (const original of contenido.split('\n')) {
    const linea = original.trim();

    if (linea === '') {
      cerrarLista();
      continue;
    }

    const numerada = NUMERADA.test(linea);
    const vineta = !numerada && VINETA.test(linea);

    if (numerada || vineta) {
      const texto = linea.replace(numerada ? NUMERADA : VINETA, '');
      if (lista === null || lista.ordenada !== numerada) {
        cerrarLista();
        lista = { ordenada: numerada, items: [] };
      }
      lista.items.push(segmentar(texto));
      continue;
    }

    cerrarLista();
    bloques.push({ tipo: esSubtitulo(linea) ? 'subtitulo' : 'parrafo', segmentos: segmentar(linea) });
  }

  cerrarLista();

  return bloques;
}

export function fechaNoticia(iso: string | null): string {
  if (!iso) {
    return '';
  }

  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' }).format(new Date(iso));
}
