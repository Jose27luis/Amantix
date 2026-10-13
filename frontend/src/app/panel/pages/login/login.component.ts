import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { Usuario } from '../../models/panel.models';
import { mensajeError } from '../../models/labels';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly sesion = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verPassword = signal(false);
  protected readonly mayusculas = signal(false);
  protected readonly agitar = signal(false);
  protected readonly anio = new Date().getFullYear();

  protected readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  protected ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.agitar.set(true);
      return;
    }

    if (this.enviando()) {
      return;
    }

    const { correo, password } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);

    this.sesion
      .ingresar(correo, password)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (usuario: Usuario) => this.router.navigate([usuario.debe_cambiar_password ? '/panel/profile' : '/panel']),
        error: (error: HttpErrorResponse) => {
          this.error.set(mensajeError(error, 'No pudimos iniciar tu sesión.'));
          this.agitar.set(true);
        },
      });
  }

  protected terminarSacudida(evento: AnimationEvent): void {
    if (evento.animationName.includes('sacudir')) {
      this.agitar.set(false);
    }
  }

  protected alternarPassword(): void {
    this.verPassword.update((visible: boolean) => !visible);
  }

  protected revisarMayusculas(evento: KeyboardEvent): void {
    this.mayusculas.set(evento.getModifierState('CapsLock'));
  }

  protected invalido(control: 'correo' | 'password'): boolean {
    const campo = this.form.controls[control];
    return campo.invalid && campo.touched;
  }
}
