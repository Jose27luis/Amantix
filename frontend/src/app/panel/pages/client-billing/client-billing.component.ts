import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BillingApiService } from '../../services/billing-api.service';
import { CobranzaCliente, CuentaCobrar, DatosPago, MetodoPago, PagoReportado } from '../../models/panel.models';
import { METODOS_PAGO, etiquetaEstadoCuenta, etiquetaMetodoPago, fechaCorta, fechaHoy, formatoSoles, mensajeError } from '../../models/labels';

const MAXIMO_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

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

  protected readonly metodos = METODOS_PAGO.filter((item) => item.valor !== 'efectivo');
  protected readonly formatoSoles = formatoSoles;
  protected readonly fechaCorta = fechaCorta;
  protected readonly etiquetaEstado = etiquetaEstadoCuenta;
  protected readonly etiquetaMetodo = etiquetaMetodoPago;

  protected readonly datos = signal<CobranzaCliente | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly reportando = signal<number | null>(null);
  protected readonly enviando = signal(false);
  protected readonly errorReporte = signal<string | null>(null);
  protected pago: DatosPago = this.pagoVacio();
  protected captura: File | null = null;

  constructor() {
    this.cargar();
  }

  protected ultimoRechazo(cuenta: CuentaCobrar): PagoReportado | null {
    if (cuenta.estado !== 'pendiente') {
      return null;
    }
    const rechazados = cuenta.pagos.filter((pago: PagoReportado) => pago.estado === 'rechazado');

    return rechazados.length > 0 ? rechazados[rechazados.length - 1] : null;
  }

  protected abrirReporte(cuenta: CuentaCobrar): void {
    this.reportando.set(cuenta.id);
    this.errorReporte.set(null);
    this.pago = this.pagoVacio();
    this.captura = null;
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

  protected enviar(cuenta: CuentaCobrar): void {
    if (this.captura === null) {
      this.errorReporte.set('Adjunta la captura del pago.');
      return;
    }
    if (this.pago.numero_operacion.trim() === '' && this.pago.metodo !== 'otro') {
      this.errorReporte.set('Escribe el número de operación.');
      return;
    }

    this.enviando.set(true);
    this.errorReporte.set(null);
    this.api
      .reportar(cuenta.id, this.pago, this.captura)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.reportando.set(null);
          this.aviso.set('Recibimos tu pago. Lo revisaremos y te enviaremos tu comprobante.');
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorReporte.set(mensajeError(error, 'No pudimos enviar tu pago.')),
      });
  }

  private pagoVacio(): DatosPago {
    return { metodo: 'yape' as MetodoPago, numero_operacion: '', fecha_pago: fechaHoy(), monto: '' };
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
