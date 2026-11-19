import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BillingApiService } from '../../services/billing-api.service';
import { AjustesCobranza } from '../../models/panel.models';
import { mensajeError, textoDia } from '../../models/labels';

const EJEMPLO: Readonly<Record<string, string>> = {
  '{cliente}': 'COMERCIAL ANITA S.A.C.',
  '{concepto}': 'SERVICIO DE FACTURACION ELECTRONICA, PLAN COMPLETO CORRESPONDIENTE AL MES DE DICIEMBRE DEL 2026',
  '{monto}': 'S/ 80.00',
  '{vence}': '09/12/2026',
  '{enlace}': 'https://amantix.pe/panel/billing',
};

@Component({
  selector: 'app-billing-settings',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './billing-settings.component.html',
  styleUrls: ['../../panel-shared.css', './billing-settings.component.css'],
})
export class BillingSettingsComponent {
  private readonly api = inject(BillingApiService);

  protected readonly textoDia = textoDia;
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly variables = signal<readonly string[]>([]);
  protected readonly recordatorios = signal<readonly number[]>([]);
  protected readonly mensaje = signal('');
  protected diasAnticipacion = 3;
  protected nuevoDia = 0;

  protected readonly vistaPrevia = computed((): string =>
    Object.entries(EJEMPLO).reduce((texto: string, [variable, valor]: [string, string]) => texto.split(variable).join(valor), this.mensaje()),
  );

  constructor() {
    this.api.ajustes().subscribe({
      next: (ajustes: AjustesCobranza) => {
        this.aplicar(ajustes);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar la configuración.'));
        this.cargando.set(false);
      },
    });
  }

  protected agregarDia(): void {
    const dia = Math.trunc(Number(this.nuevoDia));
    if (!Number.isFinite(dia) || dia < -30 || dia > 60 || this.recordatorios().includes(dia)) {
      return;
    }
    this.recordatorios.update((actual: readonly number[]) => [...actual, dia].sort((a: number, b: number) => a - b));
  }

  protected quitarDia(dia: number): void {
    this.recordatorios.update((actual: readonly number[]) => actual.filter((valor: number) => valor !== dia));
  }

  protected insertar(variable: string): void {
    this.mensaje.update((actual: string) => `${actual}${actual.endsWith(' ') || actual === '' ? '' : ' '}${variable}`);
  }

  protected guardar(): void {
    this.guardando.set(true);
    this.error.set(null);
    this.aviso.set(null);
    this.api
      .guardarAjustes({
        dias_anticipacion: Number(this.diasAnticipacion),
        recordatorios: this.recordatorios(),
        mensaje: this.mensaje().trim(),
      })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (ajustes: AjustesCobranza) => {
          this.aplicar(ajustes);
          this.aviso.set('Configuración guardada.');
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos guardar la configuración.')),
      });
  }

  private aplicar(ajustes: AjustesCobranza): void {
    this.diasAnticipacion = ajustes.dias_anticipacion;
    this.recordatorios.set(ajustes.recordatorios);
    this.mensaje.set(ajustes.mensaje);
    this.variables.set(ajustes.variables);
  }
}
