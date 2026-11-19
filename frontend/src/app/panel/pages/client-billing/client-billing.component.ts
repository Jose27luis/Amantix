import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BillingApiService, nuevaClaveIdempotencia } from '../../services/billing-api.service';
import { CobranzaCliente, CuentaCobrar, DatosPago, MetodoPago, MetodoPagoCuenta } from '../../models/panel.models';
import { etiquetaEstadoCuenta, etiquetaEstadoPago, fechaCorta, fechaHoy, formatoSoles, mensajeError } from '../../models/labels';

const MAXIMO_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

interface Formulario {
  readonly titulo: string;
  readonly cuentaId: number | null;
  readonly maximo: number;
}

@Component({
  selector: 'app-client-billing',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-billing.component.html',
  styleUrls: ['../../panel-shared.css', './client-billing.component.css'],
})
export class ClientBillingComponent {
  private readonly api = inject(BillingApiService);

  protected readonly formatoSoles = formatoSoles;
  protected readonly fechaCorta = fechaCorta;
  protected readonly etiquetaEstado = etiquetaEstadoCuenta;
  protected readonly etiquetaEstadoPago = etiquetaEstadoPago;
  protected readonly hoy = fechaHoy();

  protected readonly datos = signal<CobranzaCliente | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly copiado = signal<string | null>(null);

  protected readonly formulario = signal<Formulario | null>(null);
  protected readonly enviando = signal(false);
  protected readonly errorReporte = signal<string | null>(null);
  protected pago: DatosPago = this.pagoVacio(null, 0);
  protected captura: File | null = null;

  constructor() {
    this.cargar();
  }

  protected abrirTodo(datos: CobranzaCliente): void {
    this.abrir({ titulo: 'Pagar mi deuda', cuentaId: null, maximo: datos.deuda });
  }

  protected abrirCuenta(cuenta: CuentaCobrar, datos: CobranzaCliente): void {
    this.abrir({ titulo: cuenta.concepto, cuentaId: cuenta.id, maximo: datos.deuda });
    this.pago = { ...this.pago, monto: String(cuenta.saldo) };
  }

  protected elegirCaptura(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.item(0) ?? null;
    if (archivo !== null && (!TIPOS.includes(archivo.type) || archivo.size > MAXIMO_BYTES)) {
      entrada.value = '';
      this.captura = null;
      this.errorReporte.set('La captura debe ser una imagen JPG, PNG, WEBP o un PDF de hasta 5 MB.');
      return;
    }
    this.errorReporte.set(null);
    this.captura = archivo;
  }

  protected enviar(): void {
    const actual = this.formulario();
    const metodo = this.datos()?.metodos_pago.find((item: MetodoPagoCuenta) => String(item.id) === this.pago.metodo_pago_id);
    const monto = Number(this.pago.monto);

    if (actual === null) {
      return;
    }
    if (metodo === undefined) {
      this.errorReporte.set('Elige a qué cuenta pagaste.');
      return;
    }
    if (!(monto > 0) || monto - actual.maximo > 0.001) {
      this.errorReporte.set(`El monto debe ser mayor a cero y no superar tu deuda (${formatoSoles(actual.maximo)}).`);
      return;
    }
    if (this.pago.numero_operacion.trim() === '' && metodo.tipo !== 'otro' && metodo.tipo !== 'efectivo') {
      this.errorReporte.set('Escribe el número de operación.');
      return;
    }
    if (this.captura === null) {
      this.errorReporte.set('Adjunta la captura del pago.');
      return;
    }

    this.enviando.set(true);
    this.errorReporte.set(null);
    this.api
      .reportar(this.pago, this.captura)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.formulario.set(null);
          this.aviso.set('Recibimos tu pago. Lo revisaremos y te enviaremos tu comprobante.');
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorReporte.set(mensajeError(error, 'No pudimos enviar tu pago.')),
      });
  }

  protected copiar(valor: string): void {
    navigator.clipboard
      .writeText(valor)
      .then(() => {
        this.copiado.set(valor);
        setTimeout(() => this.copiado.set(null), 2000);
      })
      .catch(() => this.copiado.set(null));
  }

  private abrir(formulario: Formulario): void {
    this.formulario.set(formulario);
    this.errorReporte.set(null);
    this.captura = null;
    this.pago = this.pagoVacio(formulario.cuentaId, formulario.maximo);
  }

  private pagoVacio(cuentaId: number | null, monto: number): DatosPago {
    const primero = this.datos()?.metodos_pago[0];

    return {
      metodo_pago_id: primero ? String(primero.id) : '',
      metodo: 'otro' as MetodoPago,
      numero_operacion: '',
      fecha_pago: fechaHoy(),
      monto: monto > 0 ? String(monto) : '',
      cuenta_id: cuentaId,
      clave_idempotencia: nuevaClaveIdempotencia(),
    };
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.misCuentas().subscribe({
      next: (datos: CobranzaCliente) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar tus pagos.'));
        this.cargando.set(false);
      },
    });
  }
}
