import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { mensajeError } from '../../models/labels';

function coincide(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('password')?.value as string;
  const confirmacion = grupo.get('confirmacion')?.value as string;
  return password === confirmacion ? null : { distinta: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrls: ['../../panel-shared.css', './profile.component.css'],
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SessionService);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly listo = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      actual: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: coincide },
  );

  protected cambiar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const obligatorio = this.sesion.usuario()?.debe_cambiar_password ?? false;
    const { actual, password, confirmacion } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);
    this.listo.set(false);

    this.sesion
      .cambiarPassword(actual, password, confirmacion)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.listo.set(true);
          if (obligatorio) {
            this.router.navigate(['/panel']);
          }
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No pudimos cambiar tu contraseña.')),
      });
  }
}
