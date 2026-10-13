import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UsersApiService } from '../../services/users-api.service';
import { SessionService } from '../../core/session.service';
import { Paginado, Usuario, UsuarioCreado } from '../../models/panel.models';
import { mensajeError } from '../../models/labels';

interface ClaveEntregada {
  readonly correo: string;
  readonly password: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrls: ['../../panel-shared.css', './users.component.css'],
})
export class UsersComponent {
  private readonly api = inject(UsersApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly sesion = inject(SessionService);

  protected buscar = '';
  private pagina = 1;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<Paginado<Usuario> | null>(null);

  protected readonly creando = signal(false);
  protected readonly errorCrear = signal<string | null>(null);
  protected readonly clave = signal<ClaveEntregada | null>(null);
  protected readonly copiado = signal(false);

  protected readonly editando = signal<number | null>(null);
  protected editNombre = '';
  protected editCorreo = '';
  protected readonly errorFila = signal<string | null>(null);
  protected readonly ocupado = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
  });

  constructor() {
    this.cargar();
  }

  protected filtrar(): void {
    this.pagina = 1;
    this.cargar();
  }

  protected irA(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  protected crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, correo } = this.form.getRawValue();
    this.creando.set(true);
    this.errorCrear.set(null);

    this.api
      .crear(nombre.trim(), correo.trim())
      .pipe(finalize(() => this.creando.set(false)))
      .subscribe({
        next: (respuesta: UsuarioCreado) => {
          this.mostrarClave(respuesta.usuario.correo, respuesta.password_temporal);
          this.form.reset();
          this.cargar();
        },
        error: (error: HttpErrorResponse) => this.errorCrear.set(mensajeError(error, 'No pudimos crear el usuario.')),
      });
  }

  protected empezarEdicion(usuario: Usuario): void {
    this.editando.set(usuario.id);
    this.editNombre = usuario.nombre;
    this.editCorreo = usuario.correo;
    this.errorFila.set(null);
  }

  protected cancelarEdicion(): void {
    this.editando.set(null);
    this.errorFila.set(null);
  }

  protected guardarEdicion(usuario: Usuario): void {
    this.ejecutar(usuario, this.api.actualizar(usuario.id, { nombre: this.editNombre.trim(), correo: this.editCorreo.trim() }), () => {
      this.editando.set(null);
    });
  }

  protected alternarActivo(usuario: Usuario): void {
    this.ejecutar(usuario, this.api.actualizar(usuario.id, { activo: !usuario.activo }), () => undefined);
  }

  protected restablecer(usuario: Usuario): void {
    this.ocupado.set(usuario.id);
    this.errorFila.set(null);

    this.api
      .restablecerPassword(usuario.id)
      .pipe(finalize(() => this.ocupado.set(null)))
      .subscribe({
        next: (respuesta: { password_temporal: string }) => this.mostrarClave(usuario.correo, respuesta.password_temporal),
        error: (error: HttpErrorResponse) => this.errorFila.set(mensajeError(error, 'No pudimos restablecer la contraseña.')),
      });
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

  protected esYo(usuario: Usuario): boolean {
    return this.sesion.usuario()?.id === usuario.id;
  }

  private mostrarClave(correo: string, password: string): void {
    this.copiado.set(false);
    this.clave.set({ correo, password });
  }

  private ejecutar(
    usuario: Usuario,
    peticion: ReturnType<UsersApiService['actualizar']>,
    alTerminar: () => void,
  ): void {
    this.ocupado.set(usuario.id);
    this.errorFila.set(null);

    peticion.pipe(finalize(() => this.ocupado.set(null))).subscribe({
      next: (actualizado: Usuario) => {
        alTerminar();
        this.resultado.update((actual: Paginado<Usuario> | null) =>
          actual ? { ...actual, data: actual.data.map((item: Usuario) => (item.id === actualizado.id ? actualizado : item)) } : actual,
        );
        if (this.esYo(actualizado)) {
          this.sesion.actualizarUsuario(actualizado);
        }
      },
      error: (error: HttpErrorResponse) => this.errorFila.set(mensajeError(error, 'No pudimos guardar el cambio.')),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api.listar(this.buscar, this.pagina).subscribe({
      next: (resultado: Paginado<Usuario>) => {
        this.resultado.set(resultado);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No pudimos cargar los usuarios.'));
        this.cargando.set(false);
      },
    });
  }
}
