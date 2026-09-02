import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PhotoResponse } from '../models/photo.model';

@Service()
export class Photo {
  private readonly http = inject(HttpClient);

  upload(propertyId: string, file: File): Observable<PhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PhotoResponse>(
      `${environment.apiUrl}/properties/${propertyId}/photos`,
      formData,
    );
  }

  delete(propertyId: string, photoId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/properties/${propertyId}/photos/${photoId}`,
    );
  }
}
