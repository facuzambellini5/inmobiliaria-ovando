import { PhotoResponse } from './photo.model';

export type PropertyType =
  'CASA' | 'DEPARTAMENTO' | 'TERRENO' | 'LOCAL_COMERCIAL' | 'CAMPO' | 'COCHERA';
export type OperationType = 'VENTA' | 'ALQUILER' | 'AMBAS' | 'INFORMATIVA';
export type Currency = 'ARS' | 'USD';
export type Zone = 'CENTRO' | 'ENSANCHE';
export type PropertyStatus = 'DISPONIBLE' | 'ALQUILADA' | 'VENDIDA';
export type TerrainType = 'RESIDENCIAL' | 'COMERCIAL';

export const propertyTypeLabels: Record<PropertyType, string> = {
  CASA: 'Casa',
  DEPARTAMENTO: 'Departamento',
  TERRENO: 'Terreno',
  LOCAL_COMERCIAL: 'Local comercial',
  CAMPO: 'Campo',
  COCHERA: 'Cochera',
};

export const operationLabels: Record<OperationType, string> = {
  VENTA: 'Venta',
  ALQUILER: 'Alquiler',
  AMBAS: 'Ambas',
  INFORMATIVA: 'Informativa',
};

export const zoneLabels: Record<Zone, string> = {
  CENTRO: 'Centro',
  ENSANCHE: 'Ensanche',
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DISPONIBLE: 'Disponible',
  ALQUILADA: 'Alquilada',
  VENDIDA: 'Vendida',
};

export interface PropertyRequest {
  title: string;
  description: string;
  type: PropertyType;
  operation: OperationType;
  salePrice?: number;
  rentPrice?: number;
  currency: Currency;
  address: string;
  zone?: Zone;
  lat: number;
  lng: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasGarage?: boolean;
  hasPatio?: boolean;
  surface?: number;
  terrainType?: TerrainType;
  status?: PropertyStatus;
}

export interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  operation: OperationType;
  salePrice?: number;
  rentPrice?: number;
  currency: Currency;
  address: string;
  zone?: Zone;
  lat: number;
  lng: number;
  status: PropertyStatus;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasGarage: boolean;
  hasPatio: boolean;
  surface?: number;
  terrainType?: TerrainType;
  createdAt: string;
  updatedAt: string;
  images: PhotoResponse[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
