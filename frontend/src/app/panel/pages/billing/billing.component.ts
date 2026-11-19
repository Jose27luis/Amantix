import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BillingApiService } from '../../services/billing-api.service';
import { CompaniesApiService } from '../../services/companies-api.service';
import { CuentaCobrar, DatosPago, Empresa, FiltroCuenta, MetodoPago, PagoReportado, Paginado, ResumenCobranza } from '../../models/panel.models';
import {
  METODOS_PAGO,
  enlaceWhatsapp,
  etiquetaEstadoCuenta,
  etiquetaMetodoPago,
  fechaCorta,
  fechaHoy,
  formatoSoles,
  mensajeError,
} from '../../models/labels';

type Accion = { readonly tipo: 'cobrar' | 'anular'; readonly cuenta: CuentaCobrar };

const FILTROS: readonly { readonly valor: FiltroCuenta; readonly etiqueta: string }[] = [
  { valor: 'por_cobrar', etiqueta: 'Por cobrar' },
  { valor: 'vencidas', etiqueta: 'Vencidas' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'en_revision', etiqueta: 'Pago en revisión' },
  { valor: 'pagada', etiqueta: 'Pagadas' },
  { valor: 'anulada', etiqueta: 'Anuladas' },
];

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './billing.component.html',
  styleUrls: ['../../panel-shared.css', './billing.component.css'],
})
export class BillingComponent {
  private readonly api = inject(BillingApiService);
  private readonly empresasApi = inject(CompaniesApiService);
  private readonly capturasAbiertas: string[] = [];

  protected readonly filtros = FILTROS;
  protected readonly metodos = METODOS_PAGO;
  protected readonly formatoSoles = formatoSoles;
  protected readonly fechaCorta = fechaCorta;
  protected readonly etiquetaEstado = etiquetaEstadoCuenta;
  protected readonly etiquetaMetodo = etiquetaMetodoPago;

  protected buscar = '';
  protected estado: FiltroCuenta = 'por_cobrar';
  protected readonly empresaId: string;
  private pagina = 1;

  protected readonly resumen = signal<ResumenCobranza | null>(null);
  protected readonly cuentas = signal<Paginado<CuentaCobrar> | null>(null);
  protected readonly pagos = signal<readonly PagoReportado[]>([]);
  protected readonly capturas = signal<Readonly<Record<number, string>>>({});
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly ocupado = signal<number | null>(null);

  protected readonly rechazando = signal<number | null>(null);
  protected motivoRechazo = '';

  protected readonly accion = signal<Accion | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected pago: DatosPago = this.pagoVacio();
  protected captura: File | null = null;
  protected motivoAnulacion = '';

  protected readonly creando = signal(false);
  protected readonly errorNueva = signal<string | null>(null);
  protected readonly empresasEncontradas = signal<readonly Empresa[]>([]);
  protected buscarEmpresa = '';
  protected nueva = { empresa_id: '', concepto: '', monto: '', vence: fechaHoy() };

  constructor() {
    const empresa = inject(ActivatedRoute).snapshot.queryParamMap.get('empresa_id');
    this.empresaId = empresa && /^\d+$/.test(empresa) ? empresa : '';
    if (this.empresaId !== '') {
      this.estado = 'por_cobrar';
    }
    inject(DestroyRef).onDestroy(() => this.capturasAbiertas.forEach((url: string) => URL.revokeObjectURL(url)));
    this.recargarTodo();
  }

  protected filtrar(): void {
    this.pagina = 1;
    this.cargarCuentas();
  }

  protected irA(pagina: number): void {
    this.pagina = pagina;
    this.cargarCuentas();
  }

  protected verCaptura(pago: PagoReportado): void {
    const abierta = this.capturas()[pago.id];
    if (abierta) {
      window.open(abierta, '_blank', 'noopener');
      return;
    }
    this.api.captura(pago.id).subscribe({
      next: (contenido: Blob) => {
        const url = this.guardarCaptura(pago.id, contenido);
        window.open(url, '_blank', 'noopener');
      },
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos abrir la captura.')),
    });
  }

  protected aceptar(pago: PagoReportado): void {
    this.ocupado.set(pago.id);
    this.api
      .aceptar(pago.id)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (cuenta: CuentaCobrar) => {
          this.aviso.set(this.mensajeComprobante(cuenta));
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos aceptar el pago.')),
      });
  }

  protected empezarRechazo(pago: PagoReportado): void {
    this.rechazando.set(pago.id);
    this.motivoRechazo = '';
  }

  protected rechazar(pago: PagoReportado): void {
    if (this.motivoRechazo.trim().length < 3) {
      return;
    }
    this.ocupado.set(pago.id);
    this.api
      .rechazar(pago.id, this.motivoRechazo.trim())
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.rechazando.set(null);
          this.aviso.set('Pago rechazado. El cliente verá el motivo y podrá reportarlo de nuevo.');
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos rechazar el pago.')),
      });
  }

  protected abrirAccion(tipo: Accion['tipo'], cuenta: CuentaCobrar): void {
    this.accion.set({ tipo, cuenta });
    this.errorAccion.set(null);
    this.pago = { ...this.pagoVacio(), monto: String(cuenta.monto) };
    this.captura = null;
    this.motivoAnulacion = '';
  }

  protected elegirCaptura(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    this.captura = entrada.files?.item(0) ?? null;
  }

  protected confirmarCobro(cuenta: CuentaCobrar): void {
    this.ocupado.set(cuenta.id);
    this.errorAccion.set(null);
    this.api
      .cobrar(cuenta.id, this.pago, this.captura)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (actualizada: CuentaCobrar) => {
          this.accion.set(null);
          this.aviso.set(this.mensajeComprobante(actualizada));
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.errorAccion.set(mensajeError(error, 'No pudimos registrar el cobro.')),
      });
  }

  protected confirmarAnulacion(cuenta: CuentaCobrar): void {
    this.ocupado.set(cuenta.id);
    this.errorAccion.set(null);
    this.api
      .anular(cuenta.id, this.motivoAnulacion.trim())
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.accion.set(null);
          this.aviso.set('Cuenta anulada.');
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.errorAccion.set(mensajeError(error, 'No pudimos anular la cuenta.')),
      });
  }

  protected reintentar(cuenta: CuentaCobrar): void {
    this.ocupado.set(cuenta.id);
    this.api
      .emitir(cuenta.id)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (actualizada: CuentaCobrar) => {
          this.aviso.set(this.mensajeComprobante(actualizada));
          this.cargarCuentas();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos emitir el comprobante.')),
      });
  }

  protected recordatorio(cuenta: CuentaCobrar): string | null {
    const base = enlaceWhatsapp(cuenta.empresa?.telefono ?? null);
    if (base === null) {
      return null;
    }
    const texto =
      `Hola, ${cuenta.empresa?.razon_social ?? ''}. Le recordamos que tiene pendiente: ${cuenta.concepto}, ` +
      `por ${formatoSoles(cuenta.monto)}, con vencimiento el ${fechaCorta(cuenta.vence)}. ` +
      'Puede reportar su pago con la captura en https://amantix.pe/panel/billing. Gracias, Amantix.';

    return `${base}?text=${encodeURIComponent(texto)}`;
  }

  protected alternarNueva(): void {
    this.creando.update((valor: boolean) => !valor);
    this.errorNueva.set(null);
  }

  protected buscarEmpresas(): void {
    const texto = this.buscarEmpresa.trim();
    if (texto.length < 2) {
      this.empresasEncontradas.set([]);
      return;
    }
    this.empresasApi.listar({ buscar: texto, producto_id: '', renueva_en: '', page: 1 }).subscribe({
      next: (resultado: Paginado<Empresa>) => this.empresasEncontradas.set(resultado.data),
      error: () => this.empresasEncontradas.set([]),
    });
  }

  protected crearCuenta(): void {
    const monto = Number(this.nueva.monto);
    if (this.nueva.empresa_id === '' || this.nueva.concepto.trim().length < 3 || !(monto > 0) || this.nueva.vence === '') {
      this.errorNueva.set('Elige el cliente y completa concepto, monto y vencimiento.');
      return;
    }
    this.errorNueva.set(null);
    this.ocupado.set(-1);
    this.api
      .crearCuenta({ empresa_id: Number(this.nueva.empresa_id), concepto: this.nueva.concepto.trim(), monto, vence: this.nueva.vence })
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.creando.set(false);
          this.nueva = { empresa_id: '', concepto: '', monto: '', vence: fechaHoy() };
          this.buscarEmpresa = '';
          this.empresasEncontradas.set([]);
          this.aviso.set('Cuenta por cobrar creada.');
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.errorNueva.set(mensajeError(error, 'No pudimos crear la cuenta.')),
      });
  }

  private mensajeComprobante(cuenta: CuentaCobrar): string {
    const comprobante = cuenta.comprobante;
    if (comprobante === null) {
      return 'Pago registrado.';
    }
    if (comprobante.estado === 'emitido') {
      return `Pago registrado. Se emitió ${comprobante.numero ?? 'el comprobante'}.`;
    }

    return `Pago registrado, pero el comprobante no se emitió: ${comprobante.error ?? 'error desconocido'}. Puedes reintentarlo desde la lista de pagadas.`;
  }

  private pagoVacio(): DatosPago {
    return { metodo: 'yape' as MetodoPago, numero_operacion: '', fecha_pago: fechaHoy(), monto: '' };
  }

  private guardarCaptura(pagoId: number, contenido: Blob): string {
    const url = URL.createObjectURL(contenido);
    this.capturasAbiertas.push(url);
    this.capturas.update((actual: Readonly<Record<number, string>>) => ({ ...actual, [pagoId]: url }));

    return url;
  }

  private recargarTodo(): void {
    this.api.resumen().subscribe({
      next: (resumen: ResumenCobranza) => this.resumen.set(resumen),
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cargar el resumen.')),
    });
    this.api.pagosPendientes().subscribe({
      next: (respuesta: { readonly data: readonly PagoReportado[] }) => {
        this.pagos.set(respuesta.data);
        respuesta.data
          .filter((pago: PagoReportado) => pago.tiene_captura && pago.captura_es_imagen && !this.capturas()[pago.id])
          .forEach((pago: PagoReportado) =>
            this.api.captura(pago.id).subscribe({ next: (contenido: Blob) => this.guardarCaptura(pago.id, contenido) }),
          );
      },
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cargar los pagos por revisar.')),
    });
    this.cargarCuentas();
  }

  private cargarCuentas(): void {
    this.cargando.set(true);
    this.api.cuentas({ buscar: this.buscar, estado: this.estado, empresa_id: this.empresaId, page: this.pagina }).subscribe({
      next: (resultado: Paginado<CuentaCobrar>) => {
        this.cuentas.set(resultado);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar las cuentas.'));
        this.cargando.set(false);
      },
    });
  }
}
