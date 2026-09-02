import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PropertyRequest, PropertyResponse } from '../models/property.model';

@Service()
export class Property {
  private readonly http = inject(HttpClient);

  //TODO VER SI CONVIENE PONER ACA LO DE LEER PARA REEMPLAZAR LO DE httpResource
  findById(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${environment.apiUrl}/properties/${id}`);
  }

  create(request: PropertyRequest): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(`${environment.apiUrl}/properties`, request);
  }

  update(id: string, request: PropertyRequest): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${environment.apiUrl}/properties/${id}`, request);
  }
}
