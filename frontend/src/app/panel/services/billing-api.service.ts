import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  AjustesCobranza,
  AvisoCobranza,
  CambioCuenta,
  CobranzaCliente,
  CuentaCobrar,
  DatosMetodoPago,
  DatosPago,
  MetodoPagoCuenta,
  FiltroCuenta,
  NuevaCuenta,
  PagoReportado,
  Paginado,
  ResumenCobranza,
} from '../models/panel.models';

export interface FiltrosCuenta {
  readonly buscar: string;
  readonly estado: FiltroCuenta;
  readonly empresa_id: string;
  readonly page: number;
}

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly enRevision = signal(0);

  readonly pagosEnRevision = this.enRevision.asReadonly();

  resumen(): Observable<ResumenCobranza> {
    return this.http
      .get<ResumenCobranza>('/api/admin/billing/summary')
      .pipe(tap((resumen: ResumenCobranza) => this.enRevision.set(resumen.pagos_en_revision)));
  }

  refrescarPendientes(): void {
    this.resumen().subscribe({ error: () => undefined });
  }

  cuentas(filtros: FiltrosCuenta): Observable<Paginado<CuentaCobrar>> {
    let parametros = new HttpParams().set('page', filtros.page).set('estado', filtros.estado);
    if (filtros.buscar.trim() !== '') {
      parametros = parametros.set('buscar', filtros.buscar.trim());
    }
    if (filtros.empresa_id !== '') {
      parametros = parametros.set('empresa_id', filtros.empresa_id);
    }

    return this.http.get<Paginado<CuentaCobrar>>('/api/admin/billing/receivables', { params: parametros });
  }

  crearCuenta(datos: NuevaCuenta): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>('/api/admin/billing/receivables', datos);
  }

  ajustes(): Observable<AjustesCobranza> {
    return this.http.get<AjustesCobranza>('/api/admin/billing/settings');
  }

  guardarAjustes(datos: Omit<AjustesCobranza, 'variables'>): Observable<AjustesCobranza> {
    return this.http.put<AjustesCobranza>('/api/admin/billing/settings', datos);
  }

  avisos(): Observable<{ readonly data: readonly AvisoCobranza[] }> {
    return this.http.get<{ readonly data: readonly AvisoCobranza[] }>('/api/admin/billing/notices');
  }

  marcarAviso(cuentaId: number, diaRelativo: number): Observable<{ readonly ok: boolean }> {
    return this.http.post<{ readonly ok: boolean }>(`/api/admin/billing/receivables/${cuentaId}/notices`, { dia_relativo: diaRelativo });
  }

  editarCuenta(cuentaId: number, datos: CambioCuenta): Observable<CuentaCobrar> {
    return this.http.patch<CuentaCobrar>(`/api/admin/billing/receivables/${cuentaId}`, datos);
  }

  metodos(): Observable<{ readonly data: readonly MetodoPagoCuenta[] }> {
    return this.http.get<{ readonly data: readonly MetodoPagoCuenta[] }>('/api/admin/billing/payment-accounts');
  }

  crearMetodo(datos: DatosMetodoPago): Observable<MetodoPagoCuenta> {
    return this.http.post<MetodoPagoCuenta>('/api/admin/billing/payment-accounts', datos);
  }

  editarMetodo(id: number, datos: Partial<DatosMetodoPago>): Observable<MetodoPagoCuenta> {
    return this.http.patch<MetodoPagoCuenta>(`/api/admin/billing/payment-accounts/${id}`, datos);
  }

  eliminarMetodo(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/billing/payment-accounts/${id}`);
  }

  anular(cuentaId: number, motivo: string): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`/api/admin/billing/receivables/${cuentaId}/void`, { motivo });
  }

  cobrar(cuentaId: number, datos: DatosPago, captura: File | null): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`/api/admin/billing/receivables/${cuentaId}/payments`, this.cuerpoPago(datos, captura));
  }

  emitir(cuentaId: number): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`/api/admin/billing/receivables/${cuentaId}/invoice`, {});
  }

  pagosPendientes(): Observable<{ readonly data: readonly PagoReportado[] }> {
    return this.http.get<{ readonly data: readonly PagoReportado[] }>('/api/admin/billing/payments/pending');
  }

  aceptar(pagoId: number): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`/api/admin/billing/payments/${pagoId}/accept`, {}).pipe(tap(() => this.refrescarPendientes()));
  }

  rechazar(pagoId: number, motivo: string): Observable<CuentaCobrar> {
    return this.http
      .post<CuentaCobrar>(`/api/admin/billing/payments/${pagoId}/reject`, { motivo })
      .pipe(tap(() => this.refrescarPendientes()));
  }

  captura(pagoId: number): Observable<Blob> {
    return this.http.get(`/api/billing/payments/${pagoId}/capture`, { responseType: 'blob' });
  }

  misCuentas(): Observable<CobranzaCliente> {
    return this.http.get<CobranzaCliente>('/api/client/billing');
  }

  reportar(cuentaId: number, datos: DatosPago, captura: File): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`/api/client/billing/receivables/${cuentaId}/payments`, this.cuerpoPago(datos, captura));
  }

  private cuerpoPago(datos: DatosPago, captura: File | null): FormData {
    const cuerpo = new FormData();
    if (datos.metodo_pago_id !== '') {
      cuerpo.append('metodo_pago_id', datos.metodo_pago_id);
    } else {
      cuerpo.append('metodo', datos.metodo);
    }
    cuerpo.append('fecha_pago', datos.fecha_pago);
    if (datos.numero_operacion.trim() !== '') {
      cuerpo.append('numero_operacion', datos.numero_operacion.trim());
    }
    if (datos.monto.trim() !== '') {
      cuerpo.append('monto', datos.monto.trim());
    }
    if (captura !== null) {
      cuerpo.append('captura', captura, captura.name);
    }

    return cuerpo;
  }
}
