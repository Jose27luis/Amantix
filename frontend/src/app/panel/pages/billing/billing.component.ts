import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BillingApiService, nuevaClaveIdempotencia } from '../../services/billing-api.service';
import { CompaniesApiService } from '../../services/companies-api.service';
import {
  AjustesCobranza,
  AvisoCobranza,
  CuentaCobrar,
  DatosPago,
  Empresa,
  EstadoPago,
  FiltroCuenta,
  MetodoPago,
  MetodoPagoCuenta,
  PagoReportado,
  Paginado,
  ResumenCobranza,
} from '../../models/panel.models';
import {
  enlaceWhatsapp,
  etiquetaEstadoCuenta,
  etiquetaEstadoPago,
  etiquetaMetodoPago,
  fechaCorta,
  fechaHoy,
  formatoSoles,
  mensajeError,
  textoDia,
} from '../../models/labels';

type Accion = { readonly tipo: 'cobrar' | 'anular' | 'editar'; readonly cuenta: CuentaCobrar };
type Pestana = 'cuentas' | 'pagos';
type Revision = { monto: string; numero: string; motivo: string; rechazando: boolean };

const FILTROS: readonly { readonly valor: FiltroCuenta; readonly etiqueta: string }[] = [
  { valor: 'por_cobrar', etiqueta: 'Por cobrar' },
  { valor: 'vencidas', etiqueta: 'Vencidas' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'parcial', etiqueta: 'Pago parcial' },
  { valor: 'pagada', etiqueta: 'Pagadas' },
  { valor: 'anulada', etiqueta: 'Anuladas' },
];

const ESTADOS_PAGO: readonly { readonly valor: EstadoPago; readonly etiqueta: string }[] = [
  { valor: 'en_revision', etiqueta: 'Por revisar' },
  { valor: 'aceptado', etiqueta: 'Aceptados' },
  { valor: 'rechazado', etiqueta: 'Rechazados' },
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
  private plantilla = '';

  protected readonly filtros = FILTROS;
  protected readonly estadosPago = ESTADOS_PAGO;
  protected readonly formatoSoles = formatoSoles;
  protected readonly fechaCorta = fechaCorta;
  protected readonly etiquetaEstado = etiquetaEstadoCuenta;
  protected readonly etiquetaEstadoPago = etiquetaEstadoPago;
  protected readonly etiquetaMetodo = etiquetaMetodoPago;
  protected readonly textoDia = textoDia;

  protected readonly pestana = signal<Pestana>('cuentas');
  protected buscar = '';
  protected estado: FiltroCuenta = 'por_cobrar';
  protected buscarPago = '';
  protected readonly estadoPago = signal<EstadoPago>('en_revision');
  protected readonly empresaId: string;
  private pagina = 1;
  private paginaPagos = 1;

  protected readonly resumen = signal<ResumenCobranza | null>(null);
  protected readonly cuentas = signal<Paginado<CuentaCobrar> | null>(null);
  protected readonly pagos = signal<Paginado<PagoReportado> | null>(null);
  protected readonly avisos = signal<readonly AvisoCobranza[]>([]);
  protected readonly metodosPago = signal<readonly MetodoPagoCuenta[]>([]);
  protected readonly capturas = signal<Readonly<Record<number, string>>>({});
  protected readonly revisiones = signal<Readonly<Record<number, Revision>>>({});
  protected readonly cargando = signal(true);
  protected readonly cargandoPagos = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly ocupado = signal<string | null>(null);

  protected readonly accion = signal<Accion | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected pago: DatosPago = this.pagoVacio(null);
  protected cobroCon = '';
  protected captura: File | null = null;
  protected motivoAnulacion = '';
  protected edicion = { concepto: '', monto: '', vence: '' };

  protected readonly creando = signal(false);
  protected readonly errorNueva = signal<string | null>(null);
  protected readonly empresasEncontradas = signal<readonly Empresa[]>([]);
  protected buscarEmpresa = '';
  protected nueva = { empresa_id: '', concepto: '', monto: '', vence: fechaHoy() };

  constructor() {
    const parametros = inject(ActivatedRoute).snapshot.queryParamMap;
    const empresa = parametros.get('empresa_id');
    this.empresaId = empresa && /^\d+$/.test(empresa) ? empresa : '';
    if (parametros.get('vista') === 'pagos') {
      this.pestana.set('pagos');
    }
    inject(DestroyRef).onDestroy(() => this.capturasAbiertas.forEach((url: string) => URL.revokeObjectURL(url)));
    this.api.metodos().subscribe({
      next: (respuesta: { readonly data: readonly MetodoPagoCuenta[] }) =>
        this.metodosPago.set(respuesta.data.filter((metodo: MetodoPagoCuenta) => metodo.activo)),
    });
    this.api.ajustes().subscribe({ next: (ajustes: AjustesCobranza) => (this.plantilla = ajustes.mensaje) });
    this.recargarTodo();
  }

  protected cambiarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
  }

  protected filtrar(): void {
    this.pagina = 1;
    this.cargarCuentas();
  }

  protected irA(pagina: number): void {
    this.pagina = pagina;
    this.cargarCuentas();
  }

  protected filtrarPagos(estado: EstadoPago): void {
    this.estadoPago.set(estado);
    this.paginaPagos = 1;
    this.cargarPagos();
  }

  protected buscarPagos(): void {
    this.paginaPagos = 1;
    this.cargarPagos();
  }

  protected irAPagos(pagina: number): void {
    this.paginaPagos = pagina;
    this.cargarPagos();
  }

  protected revision(pago: PagoReportado): Revision {
    return this.revisiones()[pago.id] ?? { monto: String(pago.monto), numero: pago.numero_operacion ?? '', motivo: '', rechazando: false };
  }

  protected cambiarRevision(pago: PagoReportado, cambio: Partial<Revision>): void {
    this.revisiones.update((actual: Readonly<Record<number, Revision>>) => ({ ...actual, [pago.id]: { ...this.revision(pago), ...cambio } }));
  }

  protected verCaptura(pago: PagoReportado): void {
    const abierta = this.capturas()[pago.id];
    if (abierta) {
      window.open(abierta, '_blank', 'noopener');
      return;
    }
    this.api.captura(pago.id).subscribe({
      next: (contenido: Blob) => window.open(this.guardarCaptura(pago.id, contenido), '_blank', 'noopener'),
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos abrir la captura.')),
    });
  }

  protected aceptar(pago: PagoReportado): void {
    const revision = this.revision(pago);
    const monto = Number(revision.monto);
    if (!(monto > 0)) {
      this.error.set('Escribe un monto válido antes de aceptar.');
      return;
    }

    this.ocupado.set(`pago-${pago.id}`);
    this.api
      .aceptar(pago.id, {
        ...(Math.abs(monto - pago.monto) > 0.001 ? { monto } : {}),
        ...(revision.numero.trim() !== (pago.numero_operacion ?? '') ? { numero_operacion: revision.numero.trim() } : {}),
      })
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (aceptado: PagoReportado) => {
          this.aviso.set(this.mensajeComprobante(aceptado));
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(mensajeError(error, 'No pudimos aceptar el pago.'));
          this.cargarPagos();
        },
      });
  }

  protected rechazar(pago: PagoReportado): void {
    const motivo = this.revision(pago).motivo.trim();
    if (motivo.length < 3) {
      return;
    }
    this.ocupado.set(`pago-${pago.id}`);
    this.api
      .rechazar(pago.id, motivo)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.aviso.set('Pago rechazado. El cliente verá el motivo y podrá reportarlo de nuevo.');
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(mensajeError(error, 'No pudimos rechazar el pago.'));
          this.cargarPagos();
        },
      });
  }

  protected reintentar(pago: PagoReportado): void {
    this.ocupado.set(`pago-${pago.id}`);
    this.api
      .emitir(pago.id)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (actualizado: PagoReportado) => {
          this.aviso.set(this.mensajeComprobante(actualizado));
          this.cargarPagos();
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos emitir el comprobante.')),
      });
  }

  protected abrirAccion(tipo: Accion['tipo'], cuenta: CuentaCobrar): void {
    this.accion.set({ tipo, cuenta });
    this.errorAccion.set(null);
    this.pago = { ...this.pagoVacio(cuenta.id), monto: String(cuenta.saldo) };
    this.cobroCon = this.metodosPago().length > 0 ? String(this.metodosPago()[0].id) : 'efectivo';
    this.captura = null;
    this.motivoAnulacion = '';
    this.edicion = { concepto: cuenta.concepto, monto: String(cuenta.monto), vence: cuenta.vence };
  }

  protected elegirCaptura(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    this.captura = entrada.files?.item(0) ?? null;
  }

  protected confirmarCobro(cuenta: CuentaCobrar): void {
    const datos: DatosPago =
      this.cobroCon === 'efectivo'
        ? { ...this.pago, metodo_pago_id: '', metodo: 'efectivo' }
        : { ...this.pago, metodo_pago_id: this.cobroCon };
    this.ocupado.set(`cuenta-${cuenta.id}`);
    this.errorAccion.set(null);
    this.api
      .cobrar(cuenta.id, datos, this.captura)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (pago: PagoReportado) => {
          this.accion.set(null);
          this.aviso.set(this.mensajeComprobante(pago));
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.errorAccion.set(mensajeError(error, 'No pudimos registrar el cobro.')),
      });
  }

  protected confirmarEdicion(cuenta: CuentaCobrar): void {
    const monto = Number(this.edicion.monto);
    if (this.edicion.concepto.trim().length < 3 || !(monto > 0) || this.edicion.vence === '') {
      this.errorAccion.set('Completa concepto, monto y vencimiento.');
      return;
    }
    this.ocupado.set(`cuenta-${cuenta.id}`);
    this.errorAccion.set(null);
    this.api
      .editarCuenta(cuenta.id, { concepto: this.edicion.concepto.trim(), monto, vence: this.edicion.vence })
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: () => {
          this.accion.set(null);
          this.aviso.set('Cuenta actualizada.');
          this.recargarTodo();
        },
        error: (error: HttpErrorResponse) => this.errorAccion.set(mensajeError(error, 'No pudimos guardar la cuenta.')),
      });
  }

  protected confirmarAnulacion(cuenta: CuentaCobrar): void {
    this.ocupado.set(`cuenta-${cuenta.id}`);
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

  protected recordatorio(cuenta: CuentaCobrar): string | null {
    const base = enlaceWhatsapp(cuenta.empresa?.telefono ?? null);
    if (base === null) {
      return null;
    }
    const valores: Readonly<Record<string, string>> = {
      '{cliente}': cuenta.empresa?.razon_social ?? '',
      '{concepto}': cuenta.concepto,
      '{monto}': formatoSoles(cuenta.saldo),
      '{vence}': fechaCorta(cuenta.vence),
      '{enlace}': 'https://amantix.pe/panel/billing',
    };
    const texto = Object.entries(valores).reduce(
      (actual: string, [variable, valor]: [string, string]) => actual.split(variable).join(valor),
      this.plantilla,
    );

    return `${base}?text=${encodeURIComponent(texto)}`;
  }

  protected enviarAviso(aviso: AvisoCobranza): void {
    if (aviso.whatsapp !== null) {
      window.open(aviso.whatsapp, '_blank', 'noopener');
    }
    this.marcarAviso(aviso);
  }

  protected marcarAviso(aviso: AvisoCobranza): void {
    this.api.marcarAviso(aviso.cuenta.id, aviso.dia_relativo).subscribe({
      next: () => this.avisos.update((lista: readonly AvisoCobranza[]) => lista.filter((item: AvisoCobranza) => item.cuenta.id !== aviso.cuenta.id)),
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos registrar el aviso.')),
    });
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
    this.ocupado.set('nueva');
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

  private mensajeComprobante(pago: PagoReportado): string {
    const aplicado = pago.aplicaciones.map((a) => `${a.concepto ?? 'cuenta'} (${formatoSoles(a.monto)})`).join(', ');
    const base = aplicado !== '' ? `Pago de ${formatoSoles(pago.monto)} aplicado a: ${aplicado}.` : 'Pago registrado.';
    const comprobante = pago.comprobante;
    if (comprobante === null) {
      return base;
    }
    if (comprobante.estado === 'emitido') {
      return `${base} Se emitió ${comprobante.numero ?? 'el comprobante'}.`;
    }

    return `${base} El comprobante no se emitió: ${comprobante.error ?? 'error desconocido'}. Puedes reintentarlo en Pagos aceptados.`;
  }

  private pagoVacio(cuentaId: number | null): DatosPago {
    return {
      metodo_pago_id: '',
      metodo: 'otro' as MetodoPago,
      numero_operacion: '',
      fecha_pago: fechaHoy(),
      monto: '',
      cuenta_id: cuentaId,
      clave_idempotencia: nuevaClaveIdempotencia(),
    };
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
    this.api.avisos().subscribe({
      next: (respuesta: { readonly data: readonly AvisoCobranza[] }) => this.avisos.set(respuesta.data),
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cargar los avisos de hoy.')),
    });
    this.revisiones.set({});
    this.cargarCuentas();
    this.cargarPagos();
  }

  private cargarPagos(): void {
    this.cargandoPagos.set(true);
    this.api
      .pagos({ buscar: this.buscarPago, estado: this.estadoPago(), empresa_id: this.empresaId, page: this.paginaPagos })
      .pipe(finalize(() => this.cargandoPagos.set(false)))
      .subscribe({
        next: (resultado: Paginado<PagoReportado>) => {
          this.pagos.set(resultado);
          resultado.data
            .filter((pago: PagoReportado) => pago.estado === 'en_revision' && pago.tiene_captura && pago.captura_es_imagen && !this.capturas()[pago.id])
            .forEach((pago: PagoReportado) =>
              this.api.captura(pago.id).subscribe({ next: (contenido: Blob) => this.guardarCaptura(pago.id, contenido) }),
            );
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cargar los pagos.')),
      });
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
