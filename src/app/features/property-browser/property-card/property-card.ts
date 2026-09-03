import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PropertyResponse,
  propertyTypeLabels,
  operationLabels,
  zoneLabels,
} from '../../../core/models/property.model';

@Component({
  selector: 'app-property-card',
  imports: [DecimalPipe, RouterLink],
  styleUrl: './property-card.scss',
  templateUrl: './property-card.html',
})
export class PropertyCard {
  property = input.required<PropertyResponse>();

  protected readonly typeLabels = propertyTypeLabels;
  protected readonly operationLabels = operationLabels;
  protected readonly zoneLabels = zoneLabels;
}
