import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LeadService } from '../../services/lead.service';
import { LeadReceipt } from '../../models/lead.model';
import { SeoService } from '../../core/seo.service';

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
    inject(SeoService).aplicar({
      titulo: 'Solicitud recibida',
      descripcion: 'Recibimos tu solicitud. Un asesor de Amantix se comunicará contigo.',
      ruta: '/gracias',
      indexar: false,
    });

    const current = this.leadService.receipt();
    if (!current) {
      this.router.navigate(['/contacto']);
      this.receipt = { registration: '', productLabel: '', source: '' };
      return;
    }
    this.receipt = current;
  }
}
