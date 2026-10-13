import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LeadService, UNDECIDED_PRODUCT } from '../../services/lead.service';
import { ApiValidationError, Lead } from '../../models/lead.model';
import { PRODUCTS } from '../../data/products';

interface ProductOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly leadService = inject(LeadService);
  private readonly router = inject(Router);

  protected readonly productOptions: readonly ProductOption[] = [
    ...PRODUCTS.map((product): ProductOption => ({ value: product.slug, label: product.name })),
    { value: UNDECIDED_PRODUCT, label: 'Varios / aún no estoy seguro' },
  ];

  protected readonly enviando = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    company: ['', [Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    phone: ['', [Validators.pattern(/^[0-9+\s()-]{6,30}$/)]],
    productInterest: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(3000)]],
    website: [''],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.enviando()) {
      return;
    }

    const lead: Lead = this.form.getRawValue();
    this.enviando.set(true);
    this.errorEnvio.set(null);

    this.leadService
      .register(lead)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/gracias']),
        error: (error: HttpErrorResponse) => this.errorEnvio.set(this.mensajeDeError(error)),
      });
  }

  protected isInvalid(control: 'name' | 'email' | 'phone' | 'productInterest' | 'message'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  private mensajeDeError(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return 'Recibimos varias solicitudes seguidas. Espera un minuto o escríbenos por WhatsApp.';
    }

    if (error.status === 422) {
      const cuerpo = error.error as ApiValidationError;
      const primero = cuerpo.errors ? Object.values(cuerpo.errors)[0]?.[0] : undefined;
      return primero ?? cuerpo.message;
    }

    return 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.';
  }
}
