import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CompaniesApiService } from '../../services/companies-api.service';
import { CatalogApiService } from '../../services/catalog-api.service';
import { DatosEmpresa, Empresa, Paginado, ProductoResumen } from '../../models/panel.models';
import { fechaCorta, mensajeError } from '../../models/labels';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './companies.component.html',
  styleUrls: ['../../panel-shared.css', './companies.component.css'],
})
export class CompaniesComponent {
  private readonly api = inject(CompaniesApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly productos = toSignal(inject(CatalogApiService).productos$, {
    initialValue: [] as readonly ProductoResumen[],
  });
  protected readonly fechaCorta = fechaCorta;

  protected buscar = '';
  protected productoId = '';
  protected renuevaEn = '';
  private pagina = 1;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<Paginado<Empresa> | null>(null);

  protected readonly mostrandoAlta = signal(false);
  protected readonly creando = signal(false);
  protected readonly errorAlta = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    razon_social: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    ruc: ['', [Validators.required, Validators.pattern(/^(10|15|16|17|20)\d{9}$/)]],
    rubro: ['', [Validators.maxLength(120)]],
    direccion: ['', [Validators.maxLength(255)]],
    contacto: ['', [Validators.maxLength(120)]],
    telefono: ['', [Validators.pattern(/^[0-9+\s()-]{6,30}$/)]],
    correo: ['', [Validators.email, Validators.maxLength(160)]],
  });

  constructor() {
    const renueva = inject(ActivatedRoute).snapshot.queryParamMap.get('renueva_en');
    if (renueva && /^\d+$/.test(renueva)) {
      this.renuevaEn = renueva;
    }
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

  protected abrir(empresa: Empresa): void {
    this.router.navigate(['/panel/companies', empresa.id]);
  }

  protected alternarAlta(): void {
    this.mostrandoAlta.update((valor: boolean) => !valor);
    this.errorAlta.set(null);
  }

  protected crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
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

    this.creando.set(true);
    this.errorAlta.set(null);

    this.api
      .crear(datos)
      .pipe(finalize(() => this.creando.set(false)))
      .subscribe({
        next: (empresa: Empresa) => this.router.navigate(['/panel/companies', empresa.id]),
        error: (error: HttpErrorResponse) => this.errorAlta.set(mensajeError(error, 'No pudimos registrar la empresa.')),
      });
  }

  protected invalido(control: 'razon_social' | 'ruc' | 'telefono' | 'correo'): boolean {
    const campo = this.form.controls[control];
    return campo.invalid && campo.touched;
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.api
      .listar({ buscar: this.buscar, producto_id: this.productoId, renueva_en: this.renuevaEn, page: this.pagina })
      .subscribe({
        next: (resultado: Paginado<Empresa>) => {
          this.resultado.set(resultado);
          this.cargando.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(mensajeError(error, 'No pudimos cargar los clientes.'));
          this.cargando.set(false);
        },
      });
  }
}
