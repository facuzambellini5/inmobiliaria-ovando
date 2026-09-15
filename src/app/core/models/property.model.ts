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

export const terrainTypeLabels: Record<TerrainType, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
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

// Metadata de paginación cuando el backend la manda ANIDADA bajo "page"
// en vez de suelta en la raíz (ver comentario de `Page` más abajo).
export interface PageMetadata {
  size?: number;
  number?: number;
  totalElements?: number;
  totalPages?: number;
}

// Spring Data puede serializar un Page<T> de dos formas bien distintas
// según cómo esté configurado el backend (EnableSpringDataWebSupport /
// pageSerializationMode):
//   - "plana" (PageImpl de toda la vida): totalElements/totalPages van
//     sueltos en la raíz, junto a "content".
//   - "anidada" (PagedModel — el modo VIA_DTO, que es el que recomienda
//     y a veces activa por defecto Spring Data 3.3+): la raíz solo tiene
//     "content" y un objeto "page" con { size, number, totalElements,
//     totalPages } adentro.
// No sabemos de antemano cuál de las dos usa el backend (y puede cambiar
// sin que este frontend se entere), así que el modelo contempla ambas y
// `pageTotalElements`/`pageTotalPages` más abajo son la forma correcta
// de leer estos valores sin importar cuál esté activa.
export interface Page<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
  page?: PageMetadata;
}

// Total de elementos de una respuesta paginada, sin importar si el
// backend lo mandó suelto en la raíz o anidado adentro de "page". Usar
// SIEMPRE esta función (y `pageTotalPages`) en vez de leer
// `.totalElements` directo — leerlo directo es lo que rompe el conteo
// ("0 propiedades") y esconde los botones de paginación cuando el
// backend está en modo anidado.
export function pageTotalElements<T>(page: Page<T> | undefined): number {
  return page?.totalElements ?? page?.page?.totalElements ?? 0;
}

export function pageTotalPages<T>(page: Page<T> | undefined): number {
  return page?.totalPages ?? page?.page?.totalPages ?? 0;
}
