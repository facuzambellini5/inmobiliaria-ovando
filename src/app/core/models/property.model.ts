/**
 * Los "enums" del backend (PropertyType, OperationType, etc.) los modelamos
 * como union types de strings, no como `enum` de TypeScript. Es la forma
 * moderna recomendada: son más simples, y matchean 1 a 1 con el string
 * literal que realmente viaja en el JSON (ej: "CASA"), sin capas extra.
 */
export type PropertyType =
  'CASA' | 'DEPARTAMENTO' | 'TERRENO' | 'LOCAL_COMERCIAL' | 'CAMPO' | 'COCHERA';
export type OperationType = 'VENTA' | 'ALQUILER' | 'AMBAS' | 'INFORMATIVA';
export type Currency = 'ARS' | 'USD';
export type Zone = 'CENTRO' | 'ENSANCHE';
export type PropertyStatus = 'DISPONIBLE' | 'ALQUILADA' | 'VENDIDA';
export type TerrainType = 'RESIDENCIAL' | 'COMERCIAL';

// Lo que devuelve el backend por cada propiedad (schema PropertyResponse).
// Los campos marcados con "?" son los que solo aplican según el tipo de
// propiedad/operación (ej: un terreno no tiene bathrooms; un alquiler no
// tiene salePrice) — por eso pueden venir ausentes.
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
  images: string[];
}

/**
 * Spring Data envuelve cualquier listado paginado con esta misma forma
 * (content, totalElements, number, etc.), sin importar qué entidad sea.
 * Por eso el tipo es GENÉRICO (<T>): sirve para Page<PropertyResponse> hoy,
 * y el día de mañana para Page<CualquierOtraCosa> sin escribir un tipo nuevo.
 *
 * Nota: el JSON real trae más campos (pageable, sort) que acá no incluimos
 * a propósito — no los vamos a usar, y agregarlos solo sería ruido. Eso no
 * rompe nada: TypeScript describe lo que a NOSOTROS nos importa leer, no
 * tiene que ser un espejo 100% completo de la respuesta.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual, empieza en 0
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
