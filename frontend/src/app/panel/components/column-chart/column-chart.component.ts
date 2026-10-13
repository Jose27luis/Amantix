import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface ColumnPoint {
  readonly etiqueta: string;
  readonly detalle: string;
  readonly valor: number;
}

interface ColumnBar extends ColumnPoint {
  readonly x: number;
  readonly y: number;
  readonly alto: number;
  readonly centro: number;
}

const ALTO = 200;
const ANCHO = 600;
const MARGEN_IZQ = 32;
const MARGEN_INF = 26;
const MARGEN_SUP = 12;

let instancias = 0;

@Component({
  selector: 'app-column-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.css',
})
export class ColumnChartComponent {
  readonly puntos = input.required<readonly ColumnPoint[]>();
  readonly unidad = input('leads');

  protected readonly gradiente = `columnas-${++instancias}`;
  protected readonly ancho = ANCHO;
  protected readonly alto = ALTO;
  protected readonly base = ALTO - MARGEN_INF;
  protected readonly izquierda = MARGEN_IZQ;
  protected readonly activo = signal<number | null>(null);

  protected readonly maximo = computed(() => {
    const mayor = Math.max(0, ...this.puntos().map((punto: ColumnPoint) => punto.valor));
    return mayor <= 4 ? 4 : Math.ceil(mayor / 4) * 4;
  });

  protected readonly guias = computed(() => {
    const maximo = this.maximo();
    return [0, 0.5, 1].map((fraccion: number) => ({
      valor: Math.round(maximo * fraccion),
      y: this.base - (this.base - MARGEN_SUP) * fraccion,
    }));
  });

  protected readonly barras = computed((): readonly ColumnBar[] => {
    const puntos = this.puntos();
    const maximo = this.maximo();
    const paso = (ANCHO - MARGEN_IZQ) / Math.max(puntos.length, 1);
    const anchoBarra = this.anchoBarra();

    return puntos.map((punto: ColumnPoint, indice: number): ColumnBar => {
      const alto = maximo === 0 ? 0 : ((this.base - MARGEN_SUP) * punto.valor) / maximo;
      const centro = MARGEN_IZQ + paso * indice + paso / 2;
      return { ...punto, x: centro - anchoBarra / 2, y: this.base - alto, alto, centro };
    });
  });

  protected readonly anchoBarra = computed(() => {
    const paso = (ANCHO - MARGEN_IZQ) / Math.max(this.puntos().length, 1);
    return Math.min(28, paso - 2);
  });

  protected readonly seleccion = computed((): ColumnBar | null => {
    const indice = this.activo();
    return indice === null ? null : (this.barras()[indice] ?? null);
  });

  protected ruta(barra: ColumnBar): string {
    const ancho = this.anchoBarra();
    const radio = Math.min(4, barra.alto, ancho / 2);
    const { x, y } = barra;
    const fondo = this.base;

    if (barra.alto <= 0) {
      return '';
    }

    return `M${x},${fondo} V${y + radio} Q${x},${y} ${x + radio},${y} H${x + ancho - radio} Q${x + ancho},${y} ${x + ancho},${y + radio} V${fondo} Z`;
  }

  protected tooltipX(barra: ColumnBar): number {
    return (barra.centro / ANCHO) * 100;
  }
}
