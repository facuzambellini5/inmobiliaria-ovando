import { Component, output, signal } from '@angular/core';
import {
  PropertyType,
  OperationType,
  Zone,
  propertyTypeLabels,
  operationLabels,
  zoneLabels,
} from '../../../core/models/property.model';

export interface PropertyFiltersValue {
  type: PropertyType | '';
  operation: OperationType | '';
  zone: Zone | '';
  minPrice: number | null;
  maxPrice: number | null;
}

function emptyFilters(): PropertyFiltersValue {
  return { type: '', operation: '', zone: '', minPrice: null, maxPrice: null };
}

/**
 * Maneja los 5 campos de filtro y el botón "Limpiar" con estado PROPIO
 * (no recibe nada por @Input) — el padre no necesita saber nada de los
 * filtros hasta que el usuario efectivamente elige algo, momento en el
 * que este componente le avisa con el objeto completo ya armado.
 */
@Component({
  selector: 'app-property-filters',
  imports: [],
  styleUrl: './property-filters.scss',
  templateUrl: './property-filters.html',
})
export class PropertyFilters {
  filtersChange = output<PropertyFiltersValue>();

  protected readonly type = signal<PropertyType | ''>('');
  protected readonly operation = signal<OperationType | ''>('');
  protected readonly zone = signal<Zone | ''>('');
  protected readonly minPrice = signal<number | null>(null);
  protected readonly maxPrice = signal<number | null>(null);

  protected readonly typeOptions = Object.entries(propertyTypeLabels) as [PropertyType, string][];
  protected readonly operationOptions = Object.entries(operationLabels) as [
    OperationType,
    string,
  ][];
  protected readonly zoneOptions = Object.entries(zoneLabels) as [Zone, string][];

  protected onTypeChange(value: string): void {
    this.type.set(value as PropertyType | '');
    this.emitChange();
  }

  protected onOperationChange(value: string): void {
    this.operation.set(value as OperationType | '');
    this.emitChange();
  }

  protected onZoneChange(value: string): void {
    this.zone.set(value as Zone | '');
    this.emitChange();
  }

  protected onMinPriceChange(value: string): void {
    this.minPrice.set(value === '' ? null : Number(value));
    this.emitChange();
  }

  protected onMaxPriceChange(value: string): void {
    this.maxPrice.set(value === '' ? null : Number(value));
    this.emitChange();
  }

  protected onClear(): void {
    this.type.set('');
    this.operation.set('');
    this.zone.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.emitChange();
  }

  private emitChange(): void {
    this.filtersChange.emit({
      type: this.type(),
      operation: this.operation(),
      zone: this.zone(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
    });
  }
}

export { emptyFilters };
