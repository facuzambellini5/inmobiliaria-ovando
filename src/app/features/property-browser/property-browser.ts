import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Page,
  PropertyResponse,
  pageTotalElements,
  pageTotalPages,
} from '../../core/models/property.model';
import { PropertyFilters, PropertyFiltersValue } from './property-filters/property-filters';
import { PropertyCard } from './property-card/property-card';
import { Pagination } from '../../shared/pagination/pagination';

// Cuántas propiedades pedimos por página. 12 reparte parejo en la grilla
// de 3 columnas (4 filas) y en la de 2 columnas de tablet (6 filas), sin
// dejar una fila pelada a la mitad en los anchos de pantalla más comunes.
const PAGE_SIZE = 9;

function emptyFilters(): PropertyFiltersValue {
  return { type: '', operation: '', zone: '', minPrice: null, maxPrice: null };
}

@Component({
  selector: 'app-property-browser',
  imports: [PropertyFilters, PropertyCard, Pagination],
  styleUrl: './property-browser.scss',
  templateUrl: './property-browser.html',
})
export class PropertyBrowser {
  protected readonly PAGE_SIZE = PAGE_SIZE;

  protected readonly filters = signal<PropertyFiltersValue>(emptyFilters());
  // Página actual, en base 0 — el mismo criterio que Spring Data Pageable
  // usa del lado del backend, así el número viaja tal cual en el query
  // param `page` sin tener que sumar/restar 1 en el medio.
  protected readonly page = signal(0);

  // Referencia al contenedor de resultados, para poder hacer scroll hasta
  // arriba de la grilla cada vez que se cambia de página (ver
  // onPageChange). Al ser `.required`, Angular tira error en desarrollo
  // si algún día el div del template pierde el `#resultsSection` — mejor
  // eso que un scroll silenciosamente roto.
  private readonly resultsSection =
    viewChild.required<ElementRef<HTMLDivElement>>('resultsSection');

  // Todos los filtros —tipo, operación, zona y también el rango de
  // precio— viajan como query params al backend. El precio en particular
  // ya lo resuelve el backend contra el precio "relevante" de cada
  // propiedad (el de venta si tiene, si no el de alquiler): dejar que lo
  // filtre la base de datos evita duplicar esa lógica acá y, sobre todo,
  // evita que la paginación quede mal armada. Si filtráramos el precio
  // en el cliente DESPUÉS de traer una página ya paginada de 12, esa
  // página podría terminar mostrando menos de 12 resultados (o ninguno)
  // sin que eso signifique que no hay más propiedades en otras páginas.
  protected readonly properties = httpResource<Page<PropertyResponse>>(() => {
    const { type, operation, zone, minPrice, maxPrice } = this.filters();
    const params: Record<string, string | number> = {
      page: this.page(),
      size: PAGE_SIZE,
      sort: 'createdAt,desc', // las más nuevas primero
      // Solo mostramos lo DISPONIBLE en el sitio público — no tiene
      // sentido ofrecerle a un visitante algo que ya se vendió o alquiló.
      status: 'DISPONIBLE',
    };
    if (type) params['type'] = type;
    if (operation) params['operation'] = operation;
    if (zone) params['zone'] = zone;
    if (minPrice !== null) params['minPrice'] = minPrice;
    if (maxPrice !== null) params['maxPrice'] = maxPrice;

    return { url: `${environment.apiUrl}/properties`, params };
  });

  protected readonly items = computed(() => this.properties.value()?.content ?? []);
  // Usamos los helpers `pageTotalElements`/`pageTotalPages` en vez de
  // leer `.totalElements`/`.totalPages` directo del value(): el backend
  // puede mandar esos números sueltos en la raíz o anidados adentro de
  // "page" según cómo esté configurada la serialización de Spring Data
  // del otro lado, y los helpers contemplan las dos formas (ver
  // property.model.ts). Leerlos directo es lo que hacía que acá siempre
  // diera 0 con un backend en modo anidado.
  protected readonly totalElements = computed(() => pageTotalElements(this.properties.value()));
  protected readonly totalPages = computed(() => pageTotalPages(this.properties.value()));

  protected onFiltersChange(value: PropertyFiltersValue): void {
    this.filters.set(value);
    // Todo cambio de filtro vuelve a la página 1: si no, se puede quedar
    // "parado" en una página que con el filtro nuevo ya ni existe (por
    // ejemplo, estaba en la página 5 y el filtro nuevo solo tiene 2).
    this.page.set(0);
  }

  protected onPageChange(newPage: number): void {
    this.page.set(newPage);
    // Al cambiar de página volvemos arriba de la grilla: si el usuario
    // scrolleó hasta el pie para tocar "Siguiente", sin esto se queda
    // mirando el mismo lugar mientras arriba ya cambió todo el contenido.
    this.resultsSection().nativeElement.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}
