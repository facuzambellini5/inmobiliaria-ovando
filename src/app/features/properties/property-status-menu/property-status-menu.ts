import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PropertyStatus, propertyStatusLabels } from '../../../core/models/property.model';

const ALL_STATUSES: PropertyStatus[] = ['DISPONIBLE', 'ALQUILADA', 'VENDIDA'];

@Component({
  selector: 'app-property-status-menu',
  imports: [MatButtonModule, MatMenuModule],
  styleUrl: './property-status-menu.scss',
  templateUrl: './property-status-menu.html',
})
export class PropertyStatusMenu {
  currentStatus = input.required<PropertyStatus>();
  statusSelected = output<PropertyStatus>();

  protected readonly statusLabels = propertyStatusLabels;

  protected get otherStatuses(): PropertyStatus[] {
    return ALL_STATUSES.filter((status) => status !== this.currentStatus());
  }
}
