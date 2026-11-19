import { ChangeDetectionStrategy, Component, OnInit, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { CompaniesApiService } from '../../services/companies-api.service';
import { CatalogApiService } from '../../services/catalog-api.service';
import { UsersApiService } from '../../services/users-api.service';
import {
  CambioSuscripcion,
  DatosEmpresa,
  DetalleEmpresa,
  Empresa,
  EstadoSuscripcion,
  Periodo,
  Plan,
  ProductoResumen,
  Suscripcion,
  Usuario,
  UsuarioCreado,
} from '../../models/panel.models';
import {
  ESTADOS_SUSCRIPCION,
  etiquetaEstadoSuscripcion,
  etiquetaEstadoTicket,
  etiquetaPrioridad,
  fechaCorta,
  fechaHoy,
  formatoSoles,
  mensajeError,
} from '../../models/labels';

interface ClaveEntregada {
  readonly correo: string;
  readonly password: string;
}

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-detail.component.html',
  styleUrls: ['../../panel-shared.css', './company-detail.component.css'],
})
export class CompanyDetailComponent implements OnInit {
  readonly id = input.required({ transform: numberAttribute });

  private readonly api = inject(CompaniesApiService);
  private readonly usuariosApi = inject(UsersApiService);
  private readonly fb = inject(FormBuilder);
  private readonly catalogo = inject(CatalogApiService);

  protected readonly productos = toSignal(this.catalogo.productos$, { initialValue: [] as readonly ProductoResumen[] });
  protected readonly planes = toSignal(this.catalogo.planes$, { initialValue: [] as readonly Plan[] });
  protected readonly estadosSuscripcion = ESTADOS_SUSCRIPCION;
  protected readonly etiquetaEstadoSuscripcion = etiquetaEstadoSuscripcion;
  protected readonly etiquetaEstadoTicket = etiquetaEstadoTicket;
  protected readonly etiquetaPrioridad = etiquetaPrioridad;
  protected readonly fechaCorta = fechaCorta;
  protected readonly formatoSoles = formatoSoles;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly detalle = signal<DetalleEmpresa | null>(null);
  protected readonly clave = signal<ClaveEntregada | null>(null);
  protected readonly copiado = signal(false);

  protected readonly editandoDatos = signal(false);
  protected readonly guardandoDatos = signal(false);
  protected readonly errorDatos = signal<string | null>(null);

  protected readonly mostrandoSuscripcion = signal(false);
  protected readonly guardandoSuscripcion = signal(false);
  protected readonly errorSuscripcion = signal<string | null>(null);
  protected readonly ocupadoSuscripcion = signal<number | null>(null);
  protected readonly renovando = signal<number | null>(null);
  protected nuevaRenovacion = '';

  protected readonly mostrandoUsuario = signal(false);
  protected readonly guardandoUsuario = signal(false);
  protected readonly errorUsuario = signal<string | null>(null);
  protected readonly ocupadoUsuario = signal<number | null>(null);

  protected readonly datosForm = this.fb.nonNullable.group({
    razon_social: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    ruc: ['', [Validators.required, Validators.pattern(/^(10|15|16|17|20)\d{9}$/)]],
    rubro: [''],
    direccion: [''],
    contacto: [''],
    telefono: ['', [Validators.pattern(/^[0-9+\s()-]{6,30}$/)]],
    correo: ['', [Validators.email]],
  });

  protected readonly suscripcionForm = this.fb.nonNullable.group({
    producto_id: ['', [Validators.required]],
    plan_id: ['', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    periodo: ['mensual' as Periodo, [Validators.required]],
    fecha_alta: [fechaHoy(), [Validators.required]],
    proxima_renovacion: [''],
    concepto: ['', [Validators.maxLength(200)]],
  });

  protected readonly usuarioForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected empezarEdicion(empresa: Empresa): void {
    this.datosForm.setValue({
      razon_social: empresa.razon_social,
      ruc: empresa.ruc,
      rubro: empresa.rubro ?? '',
      direccion: empresa.direccion ?? '',
      contacto: empresa.contacto ?? '',
      telefono: empresa.telefono ?? '',
      correo: empresa.correo ?? '',
    });
    this.errorDatos.set(null);
    this.editandoDatos.set(true);
  }

  protected guardarDatos(empresa: Empresa): void {
    if (this.datosForm.invalid) {
      this.datosForm.markAllAsTouched();
      return;
    }

    const valores = this.datosForm.getRawValue();
    const texto = (valor: string): string | null => (valor.trim() === '' ? null : valor.trim());
    const datos: DatosEmpresa = {
      razon_social: valores.razon_social.trim(),
      ruc: valores.ruc.trim(),
      rubro: texto(valores.rubro),
      direccion: texto(valores.direccion),
      contacto: texto(valores.contacto),
      telefono: texto(valores.telefono),
      correo: texto(valores.correo),
    };

    this.guardandoDatos.set(true);
    this.errorDatos.set(null);

    this.api
      .actualizar(empresa.id, datos)
      .pipe(finalize(() => this.guardandoDatos.set(false)))
      .subscribe({
        next: () => {
          this.editandoDatos.set(false);
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorDatos.set(mensajeError(error, 'No pudimos guardar los datos.')),
      });
  }

  protected elegirPlan(): void {
    const plan = this.planes().find((item: Plan) => String(item.id) === this.suscripcionForm.controls.plan_id.value);
    if (plan) {
      this.suscripcionForm.patchValue({ precio: plan.precio, periodo: plan.periodo });
    }
  }

  protected alternarSuscripcion(): void {
    this.mostrandoSuscripcion.update((valor: boolean) => !valor);
    this.errorSuscripcion.set(null);
  }

  protected agregarSuscripcion(empresa: Empresa): void {
    if (this.suscripcionForm.invalid) {
      this.suscripcionForm.markAllAsTouched();
      return;
    }

    const valores = this.suscripcionForm.getRawValue();
    this.guardandoSuscripcion.set(true);
    this.errorSuscripcion.set(null);

    this.api
      .agregarSuscripcion(empresa.id, {
        producto_id: Number(valores.producto_id),
        plan_id: Number(valores.plan_id),
        precio: Number(valores.precio),
        periodo: valores.periodo,
        fecha_alta: valores.fecha_alta,
        ...(valores.proxima_renovacion !== '' ? { proxima_renovacion: valores.proxima_renovacion } : {}),
        ...(valores.concepto.trim() !== '' ? { concepto: valores.concepto.trim() } : {}),
      })
      .pipe(finalize(() => this.guardandoSuscripcion.set(false)))
      .subscribe({
        next: () => {
          this.mostrandoSuscripcion.set(false);
          this.suscripcionForm.reset();
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorSuscripcion.set(mensajeError(error, 'No pudimos agregar la suscripción.')),
      });
  }

  protected cambiarEstado(suscripcion: Suscripcion, estado: EstadoSuscripcion): void {
    this.actualizarSuscripcion(suscripcion, { estado });
  }

  protected empezarRenovacion(suscripcion: Suscripcion): void {
    this.renovando.set(suscripcion.id);
    this.nuevaRenovacion = this.sumarPeriodo(suscripcion.proxima_renovacion, suscripcion.periodo);
  }

  protected guardarRenovacion(suscripcion: Suscripcion): void {
    if (this.nuevaRenovacion === '') {
      return;
    }
    this.actualizarSuscripcion(suscripcion, { proxima_renovacion: this.nuevaRenovacion });
  }

  protected alternarUsuario(): void {
    this.mostrandoUsuario.update((valor: boolean) => !valor);
    this.errorUsuario.set(null);
  }

  protected crearUsuario(empresa: Empresa): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const { nombre, correo } = this.usuarioForm.getRawValue();
    this.guardandoUsuario.set(true);
    this.errorUsuario.set(null);

    this.api
      .crearUsuario(empresa.id, nombre.trim(), correo.trim())
      .pipe(finalize(() => this.guardandoUsuario.set(false)))
      .subscribe({
        next: (respuesta: UsuarioCreado) => {
          this.mostrarClave(respuesta.usuario.correo, respuesta.password_temporal);
          this.usuarioForm.reset();
          this.mostrandoUsuario.set(false);
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorUsuario.set(mensajeError(error, 'No pudimos crear el usuario.')),
      });
  }

  protected alternarActivo(usuario: Usuario): void {
    this.operarUsuario(usuario, this.usuariosApi.actualizar(usuario.id, { activo: !usuario.activo }), () => this.cargar());
  }

  protected restablecer(usuario: Usuario): void {
    this.operarUsuario(usuario, this.usuariosApi.restablecerPassword(usuario.id), (respuesta: { password_temporal: string }) =>
      this.mostrarClave(usuario.correo, respuesta.password_temporal),
    );
  }

  protected copiar(texto: string): void {
    navigator.clipboard.writeText(texto).then(
      () => this.copiado.set(true),
      () => this.copiado.set(false),
    );
  }

  protected cerrarClave(): void {
    this.clave.set(null);
    this.copiado.set(false);
  }

  protected campoInvalido(control: 'razon_social' | 'ruc' | 'telefono' | 'correo'): boolean {
    const campo = this.datosForm.controls[control];
    return campo.invalid && campo.touched;
  }

  private operarUsuario<T>(usuario: Usuario, peticion: Observable<T>, alTerminar: (respuesta: T) => void): void {
    this.ocupadoUsuario.set(usuario.id);
    this.errorUsuario.set(null);

    peticion.pipe(finalize(() => this.ocupadoUsuario.set(null))).subscribe({
      next: (respuesta: T) => alTerminar(respuesta),
      error: (error: HttpErrorResponse) => this.errorUsuario.set(mensajeError(error, 'No pudimos completar la acción.')),
    });
  }

  private actualizarSuscripcion(suscripcion: Suscripcion, cambio: CambioSuscripcion): void {
    this.ocupadoSuscripcion.set(suscripcion.id);
    this.errorSuscripcion.set(null);

    this.api
      .actualizarSuscripcion(suscripcion.id, cambio)
      .pipe(finalize(() => this.ocupadoSuscripcion.set(null)))
      .subscribe({
        next: () => {
          this.renovando.set(null);
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorSuscripcion.set(mensajeError(error, 'No pudimos actualizar la suscripción.')),
      });
  }

  private sumarPeriodo(fecha: string, periodo: Periodo): string {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const base = new Date(anio, mes - 1 + (periodo === 'anual' ? 12 : 1), 1);
    const ultimo = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    base.setDate(Math.min(dia, ultimo));
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
  }

  private mostrarClave(correo: string, password: string): void {
    this.copiado.set(false);
    this.clave.set({ correo, password });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api.ver(this.id()).subscribe({
      next: (detalle: DetalleEmpresa) => {
        this.detalle.set(detalle);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 404 ? 'Esta empresa no existe.' : mensajeError(error, 'No pudimos cargar la empresa.'));
        this.cargando.set(false);
      },
    });
  }
}
