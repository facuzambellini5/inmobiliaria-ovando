import { Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Page, PropertyResponse } from '../../core/models/property.model';
import { PropertyFilters, PropertyFiltersValue } from './property-filters/property-filters';
import { PropertyCard } from './property-card/property-card';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

function emptyFilters(): PropertyFiltersValue {
  return { type: '', operation: '', zone: '', minPrice: null, maxPrice: null };
}

/** El precio "relevante" de una propiedad para ordenar/filtrar por precio:
 * el de venta si tiene, si no el de alquiler, si no 0. */
function relevantPrice(property: PropertyResponse): number {
  return property.salePrice ?? property.rentPrice ?? 0;
}

@Component({
  selector: 'app-property-browser',
  imports: [PropertyFilters, PropertyCard],
  styleUrl: './property-browser.scss',
  templateUrl: './property-browser.html',
})
export class PropertyBrowser {
  protected readonly filters = signal<PropertyFiltersValue>(emptyFilters());
  protected readonly sortBy = signal<SortOption>('newest');

  // Tipo, operación y zona van al backend como query params — cambian
  // poco (son selects) así que un request por cambio no es problema, y
  // así el filtrado corre en la base en vez de traer de más. El precio
  // en cambio se filtra abajo, en el cliente: el input dispara (input)
  // en cada tecla, y no queremos un request por cada dígito tipeado.
  protected readonly properties = httpResource<Page<PropertyResponse>>(() => {
    const { type, operation, zone } = this.filters();
    const params: Record<string, string | number> = {
      page: 0,
      size: 50,
      // Solo mostramos lo DISPONIBLE en el sitio público — no tiene
      // sentido ofrecerle a un visitante algo que ya se vendió o alquiló.
      status: 'DISPONIBLE',
    };
    if (type) params['type'] = type;
    if (operation) params['operation'] = operation;
    if (zone) params['zone'] = zone;

    return { url: `${environment.apiUrl}/properties`, params };
  });

  protected readonly filteredProperties = computed(() => {
    const all = this.properties.value()?.content ?? [];
    const { minPrice, maxPrice } = this.filters();

    let result = all;
    if (minPrice !== null) {
      result = result.filter((property) => relevantPrice(property) >= minPrice);
    }
    if (maxPrice !== null) {
      result = result.filter((property) => relevantPrice(property) <= maxPrice);
    }

    return this.sortProperties(result);
  });

  protected onFiltersChange(value: PropertyFiltersValue): void {
    this.filters.set(value);
  }

  protected onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  private sortProperties(list: PropertyResponse[]): PropertyResponse[] {
    const sorted = [...list];
    switch (this.sortBy()) {
      case 'price-asc':
        return sorted.sort((a, b) => relevantPrice(a) - relevantPrice(b));
      case 'price-desc':
        return sorted.sort((a, b) => relevantPrice(b) - relevantPrice(a));
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }
}
