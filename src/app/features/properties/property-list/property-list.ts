import { Component, computed, inject } from '@angular/core';
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
  propertyStatusLabels,
} from '../../../core/models/property.model';
import { Property } from '../../../core/services/property';
import { PropertyTable } from '../property-table/property-table';

@Component({
  selector: 'app-property-list',
  imports: [MatButtonModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule, PropertyTable],
  styleUrl: './property-list.scss',
  templateUrl: './property-list.html',
  standalone: true,
})
export class PropertyList {
  private readonly router = inject(Router);
  private readonly propertyService = inject(Property);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly properties = httpResource<Page<PropertyResponse>>(() => ({
    url: `${environment.apiUrl}/properties`,
    params: { page: 0, size: 20 },
  }));

  protected readonly activeProperties = computed(
    () =>
      this.properties.value()?.content.filter((property) => property.status === 'DISPONIBLE') ?? [],
  );
  protected readonly historyProperties = computed(
    () =>
      this.properties.value()?.content.filter((property) => property.status !== 'DISPONIBLE') ?? [],
  );

  protected onNewProperty(): void {
    this.router.navigateByUrl('/propiedades/nueva');
  }

  protected onEditProperty(property: PropertyResponse): void {
    this.router.navigateByUrl(`/propiedades/${property.id}/editar`);
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

      this.properties.reload();
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
