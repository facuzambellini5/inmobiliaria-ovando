import { Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Page, PropertyResponse } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-list',
  imports: [],
  styleUrl: './property-list.scss',
  templateUrl: './property-list.html',
})
export class PropertyList {
  /**
   * httpResource dispara el GET solo, apenas se crea el componente — no
   * hace falta llamar a nada en un ngOnInit ni suscribirse a mano.
   * Usa HttpClient por dentro, así que el authInterceptor que armamos
   * antes se aplica automáticamente: el JWT viaja solo en este request.
   *
   * Por ahora pedimos siempre la página 0 con 20 resultados, fijo (sin
   * paginación todavía) — mantenemos el alcance en "mostrar datos reales".
   */
  protected readonly properties = httpResource<Page<PropertyResponse>>(() => ({
    url: `${environment.apiUrl}/properties`,
    params: { page: 0, size: 20 },
  }));
}
