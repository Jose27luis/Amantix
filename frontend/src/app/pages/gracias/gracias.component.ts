import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LeadService } from '../../services/lead.service';
import { LeadReceipt } from '../../models/lead.model';

@Component({
  selector: 'app-gracias',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gracias.component.html',
  styleUrl: './gracias.component.css',
})
export class GraciasComponent {
  private readonly leadService = inject(LeadService);
  private readonly router = inject(Router);

  protected readonly receipt: LeadReceipt;

  constructor() {
    const current = this.leadService.receipt();
    if (!current) {
      this.router.navigate(['/contacto']);
      this.receipt = { registration: '', productLabel: '', source: '' };
      return;
    }
    this.receipt = current;
  }
}
