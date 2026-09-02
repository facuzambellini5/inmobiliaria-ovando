// Requiere GET /api/properties/{propertyId}/photos → PhotoResponse[] en el backend.
export interface PhotoResponse {
  id: string;
  url: string;
  position: number;
}
