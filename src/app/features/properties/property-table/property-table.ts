import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {
  PropertyResponse,
  PropertyType,
  OperationType,
  Zone,
  PropertyStatus,
  propertyTypeLabels,
  operationLabels,
  zoneLabels,
  propertyStatusLabels,
} from '../../../core/models/property.model';
import { PropertyStatusMenu } from '../property-status-menu/property-status-menu';

@Component({
  selector: 'app-property-table',
  imports: [MatTableModule, MatButtonModule, DecimalPipe, PropertyStatusMenu],
  styleUrl: './property-table.scss',
  templateUrl: './property-table.html',
  standalone: true,
})
export class PropertyTable {
  properties = input.required<PropertyResponse[]>();
  emptyMessage = input('No hay propiedades para mostrar.');

  edit = output<PropertyResponse>();
  statusChange = output<{ property: PropertyResponse; newStatus: PropertyStatus }>();

  protected readonly displayedColumns = [
    'title',
    'type',
    'operation',
    'price',
    'zone',
    'status',
    'actions',
  ];

  protected typeLabel(type: PropertyType): string {
    return propertyTypeLabels[type];
  }
  protected operationLabel(operation: OperationType): string {
    return operationLabels[operation];
  }
  protected zoneLabel(zone: Zone | undefined): string {
    return zone ? zoneLabels[zone] : '—';
  }
  protected statusLabel(status: PropertyStatus): string {
    return propertyStatusLabels[status];
  }

  protected onStatusSelected(property: PropertyResponse, newStatus: PropertyStatus): void {
    this.statusChange.emit({ property, newStatus });
  }
}
