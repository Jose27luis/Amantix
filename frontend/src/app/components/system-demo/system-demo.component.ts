import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import {
  Barra,
  COMPROBANTES,
  DIAS_CAJA,
  EstadoMesa,
  MESAS,
  Mesa,
  PLATOS_VENDIDOS,
  SEMANAS_VENTAS,
} from './system-demo.data';

type Sistema = 'pro8' | 'mozo4' | 'agente';

interface Columna extends Barra {
  readonly alto: number;
}

const ETIQUETAS_MESA: Readonly<Record<EstadoMesa, string>> = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  'por-cobrar': 'Por cobrar',
};

function soles(valor: number): string {
  return `S/ ${valor.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function escala(barras: readonly Barra[]): readonly Columna[] {
  const maximo = Math.max(1, ...barras.map((barra: Barra) => barra.valor));
  return barras.map((barra: Barra) => ({ ...barra, alto: (barra.valor / maximo) * 100 }));
}

@Component({
  selector: 'app-system-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './system-demo.component.html',
  styleUrl: './system-demo.component.css',
})
export class SystemDemoComponent {
  readonly sistema = input.required<Sistema>();

  protected readonly soles = soles;
  protected readonly etiquetasMesa = ETIQUETAS_MESA;
  protected readonly estadosMesa: readonly EstadoMesa[] = ['libre', 'ocupada', 'por-cobrar'];

  protected readonly semanas = SEMANAS_VENTAS;
  protected readonly semana = signal(SEMANAS_VENTAS.length - 1);
  protected readonly diaActivo = signal<number | null>(null);
  protected readonly columnasVentas = computed(() => escala(SEMANAS_VENTAS[this.semana()].dias));
  protected readonly totalSemana = computed(() => SEMANAS_VENTAS[this.semana()].dias.reduce((suma: number, dia: Barra) => suma + dia.valor, 0));
  protected readonly comprobantes = escala(COMPROBANTES);
  protected readonly totalComprobantes = COMPROBANTES.reduce((suma: number, barra: Barra) => suma + barra.valor, 0);

  protected readonly mesas = MESAS;
  protected readonly mesaElegida = signal<number>(1);
  protected readonly mesa = computed((): Mesa => MESAS.find((item: Mesa) => item.numero === this.mesaElegida()) ?? MESAS[0]);
  protected readonly totalMesa = computed(() => this.mesa().pedido.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0));
  protected readonly ocupadas = MESAS.filter((mesa: Mesa) => mesa.estado !== 'libre').length;
  protected readonly platos = escala(PLATOS_VENDIDOS);

  protected readonly dias = DIAS_CAJA;
  protected readonly diaCaja = signal(0);
  protected readonly billeteraActiva = signal<number | null>(null);
  protected readonly billeteras = computed(() => escala(DIAS_CAJA[this.diaCaja()].billeteras));
  protected readonly totalCaja = computed(() => DIAS_CAJA[this.diaCaja()].billeteras.reduce((suma: number, barra: Barra) => suma + barra.valor, 0));
  protected readonly comisiones = computed(() => DIAS_CAJA[this.diaCaja()].comisiones);

  protected readonly titulo = computed((): string => {
    switch (this.sistema()) {
      case 'mozo4':
        return 'Sumaqta · Salón';
      case 'agente':
        return 'Agente Amantix · Cierre de caja';
      default:
        return 'Facturador Amantix · Resumen';
    }
  });
}
