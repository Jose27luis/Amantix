import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { formatoTamano } from '../../models/labels';

const MAXIMO_ARCHIVOS = 3;
const MAXIMO_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

@Component({
  selector: 'app-file-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-picker.component.html',
  styleUrl: './file-picker.component.css',
})
export class FilePickerComponent {
  readonly archivos = model<readonly File[]>([]);

  protected readonly aviso = signal<string | null>(null);
  protected readonly formatoTamano = formatoTamano;
  protected readonly maximo = MAXIMO_ARCHIVOS;

  protected elegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const nuevos = Array.from(entrada.files ?? []);
    entrada.value = '';

    const rechazados: string[] = [];
    const aceptados = nuevos.filter((archivo: File) => {
      const valido = TIPOS.includes(archivo.type) && archivo.size <= MAXIMO_BYTES;
      if (!valido) {
        rechazados.push(archivo.name);
      }
      return valido;
    });

    const total = [...this.archivos(), ...aceptados];
    this.archivos.set(total.slice(0, MAXIMO_ARCHIVOS));

    if (rechazados.length > 0) {
      this.aviso.set(`No se agregó ${rechazados.join(', ')}: solo imágenes JPG, PNG, WEBP o PDF de hasta 5 MB.`);
    } else if (total.length > MAXIMO_ARCHIVOS) {
      this.aviso.set(`Puedes adjuntar hasta ${MAXIMO_ARCHIVOS} archivos por mensaje.`);
    } else {
      this.aviso.set(null);
    }
  }

  protected quitar(indice: number): void {
    this.archivos.update((lista: readonly File[]) => lista.filter((_: File, posicion: number) => posicion !== indice));
    this.aviso.set(null);
  }
}
