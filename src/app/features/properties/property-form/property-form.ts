import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { form, FormField, submit, required, applyWhen, min } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Property } from '../../../core/services/property';
import { PropertyPhotos } from './property-photos/property-photos';
import { PropertyLocationPicker } from './property-location-picker/property-location-picker';
import {
  PropertyRequest,
  PropertyResponse,
  PropertyType,
  OperationType,
  Currency,
  Zone,
  PropertyStatus,
  propertyTypeLabels,
  operationLabels,
  zoneLabels,
  propertyStatusLabels,
} from '../../../core/models/property.model';

/**
 * El modelo del form NO puede tener null (Signal Forms no lo acepta en
 * inputs de texto/número). Para los selects que todavía no tienen una
 * opción elegida, usamos '' como "vacío" — igual que hacemos con los
 * inputs de texto — y required() se encarga de exigir que cambie.
 */
interface PropertyFormValue {
  title: string;
  description: string;
  type: PropertyType | '';
  operation: OperationType | '';
  currency: Currency | '';
  address: string;
  zone: Zone | '';
  status: PropertyStatus;
  salePrice: number;
  rentPrice: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  hasGarage: boolean;
  hasPatio: boolean;
  lat: number;
  lng: number;
}

function emptyPropertyForm(): PropertyFormValue {
  return {
    title: '',
    description: '',
    type: '',
    operation: '',
    currency: 'USD',
    address: '',
    zone: '',
    status: 'DISPONIBLE',
    salePrice: 0,
    rentPrice: 0,
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    hasGarage: false,
    hasPatio: false,
    lat: 0,
    lng: 0,
  };
}

@Component({
  selector: 'app-property-form',
  imports: [
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    PropertyPhotos,
    PropertyLocationPicker,
  ],
  styleUrl: './property-form.scss',
  templateUrl: './property-form.html',
  standalone: true,
})
export class PropertyForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(Property);

  // Referencia al componente hijo (por el #photosSection del template):
  // la usamos para "avisarle" que suba las fotos pendientes justo después
  // de crear la propiedad. No es data que fluya normalmente por @Input —
  // es un disparo puntual, por eso se justifica usar viewChild en vez de
  // pasar más estado de un lado a otro.
  private readonly photosSection = viewChild.required(PropertyPhotos);

  // Si la ruta trae :id (ej. /propiedades/abc-123/editar) estamos editando
  // una propiedad existente; si no, estamos creando una nueva. snapshot
  // alcanza acá porque "nueva" y "editar" son rutas distintas — este
  // componente se destruye y se vuelve a crear al pasar de una a otra, no
  // hace falta reaccionar a un cambio de :id en vivo.
  protected readonly propertyId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = this.propertyId !== null;

  protected readonly formModel = signal<PropertyFormValue>(emptyPropertyForm());

  protected readonly propertyForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Ingresá un título' });
    required(schemaPath.description, { message: 'Ingresá una descripción' });
    required(schemaPath.type, { message: 'Elegí un tipo de propiedad' });
    required(schemaPath.operation, { message: 'Elegí una operación' });
    required(schemaPath.currency, { message: 'Elegí una moneda' });
    required(schemaPath.address, { message: 'Ingresá una dirección' });
    required(schemaPath.zone, { message: 'Elegí una zona' });

    // "when" solo existe para required() — para exigir un mínimo de forma
    // condicional (el precio de venta solo si la operación lo incluye)
    // hace falta envolver el validador con applyWhen().
    applyWhen(
      schemaPath.salePrice,
      ({ valueOf }) => {
        const operation = valueOf(schemaPath.operation);
        return operation === 'VENTA' || operation === 'AMBAS';
      },
      (salePricePath) => {
        min(salePricePath, 1, { message: 'Ingresá el precio de venta' });
      },
    );

    applyWhen(
      schemaPath.rentPrice,
      ({ valueOf }) => {
        const operation = valueOf(schemaPath.operation);
        return operation === 'ALQUILER' || operation === 'AMBAS';
      },
      (rentPricePath) => {
        min(rentPricePath, 1, { message: 'Ingresá el precio de alquiler' });
      },
    );
  });

  // Para llenar los <mat-select> a partir de los mismos Record que ya
  // usa la tabla — una sola fuente de verdad para las etiquetas en toda
  // la app, en vez de repetir las opciones acá.
  protected readonly typeOptions = Object.entries(propertyTypeLabels) as [PropertyType, string][];
  protected readonly operationOptions = Object.entries(operationLabels) as [
    OperationType,
    string,
  ][];
  protected readonly zoneOptions = Object.entries(zoneLabels) as [Zone, string][];
  protected readonly statusOptions = Object.entries(propertyStatusLabels) as [
    PropertyStatus,
    string,
  ][];

  protected readonly saveError = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);

  constructor() {
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
    }
  }

  private async loadProperty(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const property = await firstValueFrom(this.propertyService.findById(id));
      this.formModel.set(this.mapResponseToFormValue(property));
    } catch {
      this.saveError.set('No pudimos cargar la propiedad.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapResponseToFormValue(property: PropertyResponse): PropertyFormValue {
    return {
      title: property.title,
      description: property.description,
      type: property.type,
      operation: property.operation,
      currency: property.currency,
      address: property.address,
      zone: property.zone ?? '',
      status: property.status,
      salePrice: property.salePrice ?? 0,
      rentPrice: property.rentPrice ?? 0,
      rooms: property.rooms ?? 0,
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      hasGarage: property.hasGarage,
      hasPatio: property.hasPatio,
      lat: property.lat,
      lng: property.lng,
    };
  }

  private buildRequest(): PropertyRequest {
    const value = this.formModel();
    const operation = value.operation as OperationType;
    const includesSale = operation === 'VENTA' || operation === 'AMBAS';
    const includesRent = operation === 'ALQUILER' || operation === 'AMBAS';

    return {
      title: value.title,
      description: value.description,
      type: value.type as PropertyType,
      operation,
      currency: value.currency as Currency,
      address: value.address,
      zone: value.zone === '' ? undefined : value.zone,
      status: value.status,
      // Si la operación no incluye venta/alquiler, no mandamos ese precio
      // aunque haya quedado un valor viejo cargado (ej. el usuario probó
      // "Venta", tipeó un precio, y después cambió a "Alquiler").
      salePrice: includesSale ? value.salePrice || undefined : undefined,
      rentPrice: includesRent ? value.rentPrice || undefined : undefined,
      rooms: value.rooms || undefined,
      bedrooms: value.bedrooms || undefined,
      bathrooms: value.bathrooms || undefined,
      hasGarage: value.hasGarage,
      hasPatio: value.hasPatio,
      lat: value.lat,
      lng: value.lng,
    };
  }

  protected onSubmit(): void {
    submit(this.propertyForm, async () => {
      this.saveError.set(null);
      this.isSubmitting.set(true);

      try {
        const request = this.buildRequest();
        if (this.isEditMode && this.propertyId) {
          await firstValueFrom(this.propertyService.update(this.propertyId, request));
          this.router.navigateByUrl('/propiedades');
        } else {
          // Al crear, en vez de volver al listado, vamos al modo edición
          // de la propiedad recién creada: así las fotos (que necesitan
          // un id real) quedan disponibles para subir de una, sin un paso
          // intermedio confuso de "guardá y después volvé a entrar".
          const created = await firstValueFrom(this.propertyService.create(request));
          // Recién ACÁ existe un id real: le pedimos al componente de
          // fotos que suba lo que el usuario haya elegido mientras
          // todavía estábamos creando la propiedad.
          await this.photosSection().uploadStagedFiles(created.id);
          this.router.navigateByUrl(`/propiedades/${created.id}/editar`);
        }
      } catch (error) {
        this.saveError.set(this.mapErrorToMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.router.navigateByUrl('/propiedades');
  }

  protected onLocationSelected(location: { lat: number; lng: number }): void {
    // .value.set() en vez de reasignar formModel entero: así solo se
    // notifica a los campos lat/lng, no a todo el formulario.
    this.propertyForm.lat().value.set(location.lat);
    this.propertyForm.lng().value.set(location.lng);
  }

  private mapErrorToMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return 'Revisá los datos ingresados: el backend rechazó la propiedad.';
    }
    return 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.';
  }
}
