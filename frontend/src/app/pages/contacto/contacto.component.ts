import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LeadService } from '../../services/lead.service';
import { Lead } from '../../models/lead.model';

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

  protected readonly productOptions: readonly string[] = [
    'Facturador Amantix',
    'Restaurant Sumaqta',
    'Agente Amantix',
    'Varios / aún no estoy seguro',
  ];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    productInterest: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(4)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const lead: Lead = this.form.getRawValue();
    this.leadService.register(lead);
    this.router.navigate(['/gracias']);
  }

  protected isInvalid(control: 'name' | 'email' | 'productInterest' | 'message'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }
}
