import { Component, inject, input, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../../environments/environment';
import { PhotoResponse } from '../../../../core/models/photo.model';
import { Photo } from '../../../../core/services/photo';

const MAX_PHOTOS = 15;

/** Un archivo elegido pero todavía no subido, con su preview local. */
interface StagedFile {
  file: File;
  previewUrl: string;
}

/**
 * Maneja las fotos de una propiedad en DOS modos, según si ya existe un
 * id real:
 *
 * - Modo alta (propertyId aún null): los archivos elegidos se guardan
 *   localmente con una preview (URL.createObjectURL) y NO se suben —
 *   todavía no hay dónde subirlos, porque la propiedad no existe.
 * - Modo edición (propertyId real): funciona como antes — sube/borra
 *   directo contra el backend.
 *
 * PropertyForm, después de crear la propiedad y conseguir su id real,
 * llama a uploadStagedFiles() para subir lo que haya quedado pendiente.
 */
@Component({
  selector: 'app-property-photos',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  styleUrl: './property-photos.scss',
  templateUrl: './property-photos.html',
  standalone: true,
})
export class PropertyPhotos {
  propertyId = input<string | null>(null);

  private readonly photoService = inject(Photo);
  private readonly snackBar = inject(MatSnackBar);

  // Cuando no hay propertyId, la función devuelve undefined: httpResource
  // interpreta eso como "no hay nada que pedir todavía" y no dispara
  // ningún request (a diferencia de mandarle una URL inválida).
  protected readonly photos = httpResource<PhotoResponse[]>(() => {
    const id = this.propertyId();
    return id ? { url: `${environment.apiUrl}/properties/${id}/photos` } : undefined;
  });

  protected readonly stagedFiles = signal<StagedFile[]>([]);
  protected readonly isUploading = signal(false);

  protected get totalCount(): number {
    return (this.photos.value()?.length ?? 0) + this.stagedFiles().length;
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // limpia el input, así elegir el mismo archivo de nuevo dispara el evento igual

    if (files.length === 0) {
      return;
    }

    const availableSlots = MAX_PHOTOS - this.totalCount;
    if (availableSlots <= 0) {
      this.snackBar.open('Ya llegaste al máximo de 15 fotos.', 'Cerrar', { duration: 3000 });
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);
    if (files.length > filesToAdd.length) {
      this.snackBar.open(
        `Solo se agregaron ${filesToAdd.length} (llegaste al máximo de 15 fotos).`,
        'Cerrar',
        {
          duration: 4000,
        },
      );
    }

    const propertyId = this.propertyId();
    if (propertyId) {
      this.uploadFiles(propertyId, filesToAdd);
    } else {
      const staged = filesToAdd.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
      this.stagedFiles.update((current) => [...current, ...staged]);
    }
  }

  protected removeStagedFile(item: StagedFile): void {
    // Hay que "liberar" la URL local (URL.revokeObjectURL) o el navegador
    // mantiene el archivo en memoria aunque ya no se use en ningún lado.
    URL.revokeObjectURL(item.previewUrl);
    this.stagedFiles.update((current) => current.filter((staged) => staged !== item));
  }

  protected async onDeletePhoto(photo: PhotoResponse): Promise<void> {
    const propertyId = this.propertyId();
    if (!propertyId) {
      return;
    }
    try {
      await firstValueFrom(this.photoService.delete(propertyId, photo.id));
      this.photos.reload();
    } catch {
      this.snackBar.open('No pudimos borrar la foto.', 'Cerrar', { duration: 3000 });
    }
  }

  private async uploadFiles(propertyId: string, files: File[]): Promise<void> {
    this.isUploading.set(true);
    try {
      // Subida SECUENCIAL (una espera a la otra), no en paralelo con
      // Promise.all: si una falla, sabemos exactamente cuál fue, y no
      // dejamos el orden (position) librado al azar.
      for (const file of files) {
        await firstValueFrom(this.photoService.upload(propertyId, file));
      }
    } catch {
      this.snackBar.open('No pudimos subir alguna de las fotos.', 'Cerrar', { duration: 4000 });
    } finally {
      this.photos.reload();
      this.isUploading.set(false);
    }
  }

  /**
   * Lo llama PropertyForm apenas termina de crear la propiedad, con el id
   * recién asignado por el backend, para subir lo que se había quedado
   * esperando en stagedFiles().
   */
  async uploadStagedFiles(propertyId: string): Promise<void> {
    const staged = this.stagedFiles();
    if (staged.length === 0) {
      return;
    }

    this.isUploading.set(true);
    try {
      for (const item of staged) {
        await firstValueFrom(this.photoService.upload(propertyId, item.file));
        URL.revokeObjectURL(item.previewUrl);
      }
      this.stagedFiles.set([]);
    } catch {
      this.snackBar.open('La propiedad se guardó, pero no pudimos subir alguna foto.', 'Cerrar', {
        duration: 5000,
      });
    } finally {
      this.isUploading.set(false);
    }
  }
}
