import { Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { Page, PropertyResponse } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-list',
  imports: [MatTableModule, MatProgressSpinnerModule],
  styleUrl: './property-list.scss',
  templateUrl: './property-list.html',
})
export class PropertyList {
  protected readonly properties = httpResource<Page<PropertyResponse>>(() => ({
    url: `${environment.apiUrl}/properties`,
    params: { page: 0, size: 20 },
  }));

  protected readonly displayedColumns = [
    'title',
    'type',
    'operation',
    'price',
    'address',
    'status',
  ];
}
