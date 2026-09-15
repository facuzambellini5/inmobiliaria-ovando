import { Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import {
  Page,
  PropertyRequest,
  PropertyResponse,
  PropertyStatus,
  pageTotalElements,
  pageTotalPages,
  propertyStatusLabels,
} from '../../../core/models/property.model';
import { Property } from '../../../core/services/property';
import { PropertyTable } from '../property-table/property-table';
import { Pagination } from '../../../shared/pagination/pagination';

// Cuántas propiedades mostramos por página en cada tabla. Coincide con el
// tamaño por defecto que ya usa el backend (@PageableDefault(size = 10)),
// así que ni hace falta pisarlo — lo dejamos explícito igual para que
// quede claro acá también, sin depender de un default escondido del otro lado.
const PAGE_SIZE = 10;

@Component({
  selector: 'app-property-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    PropertyTable,
    Pagination,
  ],
  styleUrl: './property-list.scss',
  templateUrl: './property-list.html',
  standalone: true,
})
export class PropertyList {
  private readonly router = inject(Router);
  private readonly propertyService = inject(Property);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  // Un signal de página POR pestaña: cada tabla pagina de forma
  // independiente (podés estar en la página 3 de "Vendidas" y en la 1 de
  // "Disponibles" al mismo tiempo), así que cada una necesita la suya.
  protected readonly availablePage = signal(0);
  protected readonly rentedPage = signal(0);
  protected readonly soldPage = signal(0);

  // Antes había un solo pedido de como máximo 20 propiedades EN TOTAL, y
  // las 3 pestañas se repartían esas 20 filtrando acá en el frontend. Si
  // había más de 20 propiedades en la base, las que sobraban quedaban
  // directamente invisibles en cualquier pestaña, sin ningún aviso.
  // Pidiéndole a cada pestaña sus propias propiedades paginadas por
  // status (el backend ya tiene el endpoint /properties/status hecho
  // justo para esto), cada una ve TODAS las que le corresponden.
  protected readonly availableProperties = this.statusResource('DISPONIBLE', this.availablePage);
  protected readonly rentedProperties = this.statusResource('ALQUILADA', this.rentedPage);
  protected readonly soldProperties = this.statusResource('VENDIDA', this.soldPage);

  // `pageTotalElements`/`pageTotalPages` en vez de leer `.totalElements`/
  // `.totalPages` directo: el backend puede mandar esos números sueltos
  // en la raíz o anidados adentro de "page" según cómo esté configurada
  // la serialización de Spring Data del otro lado (ver
  // property.model.ts), y leerlos directo es lo que hacía que las tres
  // pestañas mostraran siempre 0 y no se vieran los botones de
  // paginación.
  protected readonly availableTotal = computed(() =>
    pageTotalElements(this.availableProperties.value()),
  );
  protected readonly rentedTotal = computed(() => pageTotalElements(this.rentedProperties.value()));
  protected readonly soldTotal = computed(() => pageTotalElements(this.soldProperties.value()));

  protected readonly availableTotalPages = computed(() =>
    pageTotalPages(this.availableProperties.value()),
  );
  protected readonly rentedTotalPages = computed(() =>
    pageTotalPages(this.rentedProperties.value()),
  );
  protected readonly soldTotalPages = computed(() => pageTotalPages(this.soldProperties.value()));

  // Suma de las tres: al ser cada totalElements el conteo REAL de esa
  // pestaña (no solo de lo que entró en la página actual), esta suma da
  // el total correcto de propiedades sin importar en qué página esté
  // parada cada tabla.
  protected readonly totalProperties = computed(
    () => this.availableTotal() + this.rentedTotal() + this.soldTotal(),
  );

  protected readonly allTabsLoaded = computed(
    () =>
      this.availableProperties.hasValue() &&
      this.rentedProperties.hasValue() &&
      this.soldProperties.hasValue(),
  );

  private statusResource(status: PropertyStatus, page: WritableSignal<number>) {
    return httpResource<Page<PropertyResponse>>(() => ({
      url: `${environment.apiUrl}/properties/status`,
      params: { status, page: page(), size: PAGE_SIZE, sort: 'createdAt,desc' },
    }));
  }

  protected onNewProperty(): void {
    this.router.navigateByUrl('/admin/propiedades/nueva');
  }

  protected onEditProperty(property: PropertyResponse): void {
    this.router.navigateByUrl(`/admin/propiedades/${property.id}/editar`);
  }

  protected onStatusChange(event: { property: PropertyResponse; newStatus: PropertyStatus }): void {
    this.updateStatus(event.property, event.newStatus);
  }

  private async updateStatus(property: PropertyResponse, newStatus: PropertyStatus): Promise<void> {
    try {
      const request = this.toUpdateRequest(property, newStatus);
      await firstValueFrom(this.propertyService.update(property.id, request));

      this.snackBar.open(`Estado actualizado a "${propertyStatusLabels[newStatus]}"`, 'Cerrar', {
        duration: 3000,
      });

      // Cambiar el estado puede mover la propiedad de una pestaña a otra
      // (por ejemplo, de Disponibles a Vendidas) y no sabemos de antemano
      // cuáles dos se ven afectadas, así que refrescamos las tres y
      // volvemos a la página 1 de cada una — la propiedad recién
      // actualizada va a aparecer ahí, ordenada por más reciente.
      this.availablePage.set(0);
      this.rentedPage.set(0);
      this.soldPage.set(0);
      this.availableProperties.reload();
      this.rentedProperties.reload();
      this.soldProperties.reload();
    } catch {
      this.snackBar.open('No pudimos cambiar el estado. Probá de nuevo.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private toUpdateRequest(property: PropertyResponse, status: PropertyStatus): PropertyRequest {
    return {
      title: property.title,
      description: property.description,
      type: property.type,
      operation: property.operation,
      salePrice: property.salePrice,
      rentPrice: property.rentPrice,
      currency: property.currency,
      address: property.address,
      zone: property.zone,
      lat: property.lat,
      lng: property.lng,
      rooms: property.rooms,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      hasGarage: property.hasGarage,
      hasPatio: property.hasPatio,
      terrainType: property.terrainType,
      status,
    };
  }
}
