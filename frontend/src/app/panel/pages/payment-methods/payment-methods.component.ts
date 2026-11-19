import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BillingApiService } from '../../services/billing-api.service';
import { DatosMetodoPago, MetodoPago, MetodoPagoCuenta } from '../../models/panel.models';
import { METODOS_PAGO, etiquetaMetodoPago, mensajeError } from '../../models/labels';

interface Formulario {
  nombre: string;
  tipo: MetodoPago;
  titular: string;
  numero: string;
  cci: string;
  instrucciones: string;
  activo: boolean;
  orden: number;
}

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-methods.component.html',
  styleUrls: ['../../panel-shared.css', './payment-methods.component.css'],
})
export class PaymentMethodsComponent {
  private readonly api = inject(BillingApiService);

  protected readonly tipos = METODOS_PAGO;
  protected readonly etiquetaTipo = etiquetaMetodoPago;

  protected readonly metodos = signal<readonly MetodoPagoCuenta[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly guardando = signal(false);

  protected readonly editando = signal<number | 'nuevo' | null>(null);
  protected readonly errorForm = signal<string | null>(null);
  protected formulario: Formulario = this.vacio();

  constructor() {
    this.cargar();
  }

  protected nuevo(): void {
    this.formulario = { ...this.vacio(), orden: this.metodos().length + 1 };
    this.errorForm.set(null);
    this.editando.set('nuevo');
  }

  protected editar(metodo: MetodoPagoCuenta): void {
    this.formulario = {
      nombre: metodo.nombre,
      tipo: metodo.tipo,
      titular: metodo.titular ?? '',
      numero: metodo.numero ?? '',
      cci: metodo.cci ?? '',
      instrucciones: metodo.instrucciones ?? '',
      activo: metodo.activo,
      orden: metodo.orden,
    };
    this.errorForm.set(null);
    this.editando.set(metodo.id);
  }

  protected guardar(): void {
    if (this.formulario.nombre.trim().length < 2) {
      this.errorForm.set('Escribe el nombre del método, por ejemplo "BCP Soles".');
      return;
    }

    const texto = (valor: string): string | null => (valor.trim() === '' ? null : valor.trim());
    const datos: DatosMetodoPago = {
      nombre: this.formulario.nombre.trim(),
      tipo: this.formulario.tipo,
      titular: texto(this.formulario.titular),
      numero: texto(this.formulario.numero),
      cci: texto(this.formulario.cci),
      instrucciones: texto(this.formulario.instrucciones),
      activo: this.formulario.activo,
      orden: Number(this.formulario.orden) || 0,
    };

    const actual = this.editando();
    const peticion = actual === 'nuevo' || actual === null ? this.api.crearMetodo(datos) : this.api.editarMetodo(actual, datos);

    this.guardando.set(true);
    this.errorForm.set(null);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.editando.set(null);
        this.aviso.set('Método de pago guardado.');
        this.cargar();
      },
      error: (error: HttpErrorResponse) => this.errorForm.set(mensajeError(error, 'No pudimos guardar el método de pago.')),
    });
  }

  protected alternarActivo(metodo: MetodoPagoCuenta): void {
    this.api.editarMetodo(metodo.id, { activo: !metodo.activo }).subscribe({
      next: () => this.cargar(),
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cambiar el estado.')),
    });
  }

  protected eliminar(metodo: MetodoPagoCuenta): void {
    if (!window.confirm(`¿Eliminar "${metodo.nombre}"?`)) {
      return;
    }
    this.api.eliminarMetodo(metodo.id).subscribe({
      next: () => {
        this.aviso.set('Método de pago eliminado.');
        this.cargar();
      },
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos eliminar el método de pago.')),
    });
  }

  private vacio(): Formulario {
    return { nombre: '', tipo: 'transferencia', titular: '', numero: '', cci: '', instrucciones: '', activo: true, orden: 0 };
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.metodos().subscribe({
      next: (respuesta: { readonly data: readonly MetodoPagoCuenta[] }) => {
        this.metodos.set(respuesta.data);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar los métodos de pago.'));
        this.cargando.set(false);
      },
    });
  }
}
