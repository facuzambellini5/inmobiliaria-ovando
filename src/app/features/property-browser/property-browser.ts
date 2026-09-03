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
  // Tamaño grande a propósito: filtramos y ordenamos del lado del
  // cliente sobre esta misma tanda (igual que hacemos en el admin con
  // Activas/Historial), no hay paginación real todavía.
  protected readonly properties = httpResource<Page<PropertyResponse>>(() => ({
    url: `${environment.apiUrl}/properties`,
    params: { page: 0, size: 50 },
  }));

  protected readonly filters = signal<PropertyFiltersValue>(emptyFilters());
  protected readonly sortBy = signal<SortOption>('newest');

  protected readonly filteredProperties = computed(() => {
    const all = this.properties.value()?.content ?? [];
    const { type, operation, zone, minPrice, maxPrice } = this.filters();

    // Solo mostramos lo DISPONIBLE en el sitio público — no tiene
    // sentido ofrecerle a un visitante algo que ya se vendió o alquiló.
    let result = all.filter((property) => property.status === 'DISPONIBLE');

    if (type) {
      result = result.filter((property) => property.type === type);
    }
    if (operation) {
      // AMBAS califica tanto para el filtro "Venta" como para "Alquiler".
      result = result.filter(
        (property) => property.operation === operation || property.operation === 'AMBAS',
      );
    }
    if (zone) {
      result = result.filter((property) => property.zone === zone);
    }
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
