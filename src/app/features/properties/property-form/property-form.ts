import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  form,
  FormField,
  submit,
  required,
  applyWhen,
  min,
  hidden,
  maxLength,
} from '@angular/forms/signals';
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
  TerrainType,
  propertyTypeLabels,
  operationLabels,
  zoneLabels,
  propertyStatusLabels,
  terrainTypeLabels,
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
  surface: number;
  terrainType: TerrainType | '';
  lat: number;
  lng: number;
}

/**
 * Casa y Departamento son los únicos tipos con campos "de vivienda"
 * (ambientes, dormitorios, baños, garage, patio) — así lo dice la
 * constraint chk_house_fields en la base: para cualquier otro tipo,
 * esas columnas tienen que quedar en NULL. La usamos tanto para ocultar
 * los inputs en el HTML como para no mandarlos en el request.
 */
function isResidentialType(type: PropertyFormValue['type']): boolean {
  return type === 'CASA' || type === 'DEPARTAMENTO';
}

/**
 * Terreno es el único tipo con superficie y tipo de terreno
 * (chk_land_fields / chk_land_required en la base).
 */
function isLandType(type: PropertyFormValue['type']): boolean {
  return type === 'TERRENO';
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
    surface: 0,
    terrainType: '',
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
    // Límite de caracteres: la base no lo exige (title es TEXT, sin
    // tope), pero un título de propiedad no tiene sentido que sea un
    // párrafo — 150 caracteres alcanza y sobra.
    maxLength(schemaPath.title, 150, {
      message: 'El título no puede superar los 150 caracteres',
    });

    required(schemaPath.description, { message: 'Ingresá una descripción' });
    maxLength(schemaPath.description, 2000, {
      message: 'La descripción no puede superar los 2000 caracteres',
    });

    required(schemaPath.type, { message: 'Elegí un tipo de propiedad' });
    required(schemaPath.operation, { message: 'Elegí una operación' });
    required(schemaPath.currency, { message: 'Elegí una moneda' });

    required(schemaPath.address, { message: 'Ingresá una dirección' });
    maxLength(schemaPath.address, 200, {
      message: 'La dirección no puede superar los 200 caracteres',
    });

    required(schemaPath.zone, { message: 'Elegí una zona' });
    // Campo no tiene zona (chk_campo_zone en la base). Un campo oculto
    // con hidden() deja de "contar" para la validación del formulario,
    // así que no hace falta además volver required() condicional acá:
    // si Campo está seleccionado, el required de arriba se ignora solo.
    hidden(schemaPath.zone, {
      when: ({ valueOf }) => valueOf(schemaPath.type) === 'CAMPO',
    });

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

    // --- Campos de Casa/Departamento (chk_house_fields en la base) ---
    // Para cualquier otro tipo, se ocultan (así el usuario no los ve ni
    // los completa) y de paso ninguno de los 3 numéricos admite
    // negativos: -1 ambientes no tiene sentido en ningún tipo.
    hidden(schemaPath.rooms, {
      when: ({ valueOf }) => !isResidentialType(valueOf(schemaPath.type)),
    });
    hidden(schemaPath.bedrooms, {
      when: ({ valueOf }) => !isResidentialType(valueOf(schemaPath.type)),
    });
    hidden(schemaPath.bathrooms, {
      when: ({ valueOf }) => !isResidentialType(valueOf(schemaPath.type)),
    });
    hidden(schemaPath.hasGarage, {
      when: ({ valueOf }) => !isResidentialType(valueOf(schemaPath.type)),
    });
    hidden(schemaPath.hasPatio, {
      when: ({ valueOf }) => !isResidentialType(valueOf(schemaPath.type)),
    });

    min(schemaPath.rooms, 0, { message: 'Los ambientes no pueden ser negativos' });
    min(schemaPath.bedrooms, 0, { message: 'Los dormitorios no pueden ser negativos' });
    min(schemaPath.bathrooms, 0, { message: 'Los baños no pueden ser negativos' });

    // --- Campos de Terreno (chk_land_fields / chk_land_required) ---
    hidden(schemaPath.surface, {
      when: ({ valueOf }) => !isLandType(valueOf(schemaPath.type)),
    });
    hidden(schemaPath.terrainType, {
      when: ({ valueOf }) => !isLandType(valueOf(schemaPath.type)),
    });

    applyWhen(
      schemaPath.surface,
      ({ valueOf }) => isLandType(valueOf(schemaPath.type)),
      (surfacePath) => {
        min(surfacePath, 1, { message: 'Ingresá la superficie del terreno' });
      },
    );

    required(schemaPath.terrainType, {
      when: ({ valueOf }) => isLandType(valueOf(schemaPath.type)),
      message: 'Elegí el tipo de terreno',
    });
  });

  // Para llenar los <mat-select> a partir de los mismos Record que ya
  // usa la tabla — una sola fuente de verdad para las etiquetas en toda
  // la app, en vez de repetir las opciones acá.
  protected readonly typeOptions = Object.entries(propertyTypeLabels) as [PropertyType, string][];

  // Cochera es "solo informativa" (chk_cochera + chk_informativa en la
  // base: esas dos constraints juntas dicen que Informativa SOLO puede
  // usarse con Cochera, y que Cochera SOLO puede ser Informativa). Por
  // eso el select de operación cambia sus opciones según el tipo, en vez
  // de mostrar las 4 siempre y confiar en que el backend rechace la
  // combinación inválida.
  protected readonly operationOptions = computed(() => {
    const isCochera = this.propertyForm.type().value() === 'COCHERA';
    return (Object.entries(operationLabels) as [OperationType, string][]).filter(([key]) =>
      isCochera ? key === 'INFORMATIVA' : key !== 'INFORMATIVA',
    );
  });
  protected readonly zoneOptions = Object.entries(zoneLabels) as [Zone, string][];
  protected readonly statusOptions = Object.entries(propertyStatusLabels) as [
    PropertyStatus,
    string,
  ][];
  protected readonly terrainTypeOptions = Object.entries(terrainTypeLabels) as [
    TerrainType,
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
      surface: property.surface ?? 0,
      terrainType: property.terrainType ?? '',
      lat: property.lat,
      lng: property.lng,
    };
  }

  private buildRequest(): PropertyRequest {
    const value = this.formModel();
    const type = value.type as PropertyType;
    const operation = value.operation as OperationType;
    const includesSale = operation === 'VENTA' || operation === 'AMBAS';
    const includesRent = operation === 'ALQUILER' || operation === 'AMBAS';
    const isResidential = isResidentialType(type);
    const isLand = isLandType(type);
    const isCampo = type === 'CAMPO';

    return {
      title: value.title,
      description: value.description,
      type,
      operation,
      currency: value.currency as Currency,
      address: value.address,
      // Campo no tiene zona (chk_campo_zone) — mismo criterio que con
      // el resto de los campos condicionales: si no aplica, no se manda.
      zone: !isCampo && value.zone !== '' ? value.zone : undefined,
      status: value.status,
      // Si la operación no incluye venta/alquiler, no mandamos ese precio
      // aunque haya quedado un valor viejo cargado (ej. el usuario probó
      // "Venta", tipeó un precio, y después cambió a "Alquiler").
      salePrice: includesSale ? value.salePrice || undefined : undefined,
      rentPrice: includesRent ? value.rentPrice || undefined : undefined,
      // Igual criterio para los campos que solo aplican según el tipo:
      // si no es Casa/Departamento no mandamos ambientes/dormitorios/etc,
      // y si no es Terreno no mandamos superficie/tipo de terreno.
      rooms: isResidential ? value.rooms || undefined : undefined,
      bedrooms: isResidential ? value.bedrooms || undefined : undefined,
      bathrooms: isResidential ? value.bathrooms || undefined : undefined,
      hasGarage: isResidential ? value.hasGarage : undefined,
      hasPatio: isResidential ? value.hasPatio : undefined,
      surface: isLand ? value.surface || undefined : undefined,
      terrainType: isLand && value.terrainType !== '' ? value.terrainType : undefined,
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
          this.router.navigateByUrl('/admin/propiedades');
        } else {
          // El id real recién existe después de crear la propiedad — se
          // lo pasamos al componente de fotos para que suba lo que el
          // usuario haya elegido mientras todavía estábamos creando.
          const created = await firstValueFrom(this.propertyService.create(request));
          this.photosSection().uploadStagedFiles(created.id);
          this.router.navigateByUrl('/admin/propiedades');
        }
      } catch (error) {
        this.saveError.set(this.mapErrorToMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.router.navigateByUrl('/admin/propiedades');
  }

  /**
   * Ocultar un campo con hidden() (en el schema) hace que deje de
   * exigirse, pero NO borra el valor que haya quedado cargado en el
   * modelo. Si alguien pasa de "Casa" con 3 ambientes a "Terreno" y
   * después vuelve a "Casa", ese 3 seguiría ahí. Por eso, cada vez que
   * cambia el tipo, limpiamos a mano los campos que dejaron de aplicar.
   */
  protected onTypeChange(newType: PropertyType): void {
    if (!isResidentialType(newType)) {
      this.propertyForm.rooms().value.set(0);
      this.propertyForm.bedrooms().value.set(0);
      this.propertyForm.bathrooms().value.set(0);
      this.propertyForm.hasGarage().value.set(false);
      this.propertyForm.hasPatio().value.set(false);
    }

    if (!isLandType(newType)) {
      this.propertyForm.surface().value.set(0);
      this.propertyForm.terrainType().value.set('');
    }

    if (newType === 'CAMPO') {
      this.propertyForm.zone().value.set('');
    }

    // Cochera es la única con la operación "Informativa": si se elige
    // Cochera, la forzamos (es la única opción que va a quedar en el
    // select). Si se sale de Cochera y había quedado "Informativa"
    // puesta, la limpiamos para que el usuario elija una operación
    // válida de nuevo.
    const currentOperation = this.propertyForm.operation().value();
    if (newType === 'COCHERA' && currentOperation !== 'INFORMATIVA') {
      this.propertyForm.operation().value.set('INFORMATIVA');
    } else if (newType !== 'COCHERA' && currentOperation === 'INFORMATIVA') {
      this.propertyForm.operation().value.set('');
    }
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
