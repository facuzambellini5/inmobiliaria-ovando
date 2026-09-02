import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import L from 'leaflet';

// Resetear primero el prototipo para evitar rutas rotas
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Configuramos los íconos ANTES de crear ningún mapa: Leaflet trae rutas
// relativas a sus imágenes que se rompen al empaquetar con cualquier
// bundler moderno (Angular incluido). Servimos nosotros mismos esas 3
// imágenes desde public/leaflet/ en vez de depender de una URL externa.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Centro por defecto cuando todavía no hay ninguna ubicación cargada
// (una propiedad nueva arranca en lat/lng = 0,0, que cae en el medio del
// océano Atlántico): el centro de Sáenz Peña, Chaco.
const DEFAULT_LAT = -26.7908;
const DEFAULT_LNG = -60.4414;

/**
 * Mapa interactivo con Leaflet + OpenStreetMap (sin API key, gratis).
 * Es un componente aparte porque maneja el ciclo de vida completo de una
 * librería externa (crear el mapa, escuchar clicks/drag, destruirlo) —
 * exactamente el tipo de lógica no trivial que justifica separarlo,
 * mismo criterio que con PropertyStatusMenu.
 */
@Component({
  selector: 'app-property-location-picker',
  imports: [],
  styleUrl: './property-location-picker.scss',
  templateUrl: './property-location-picker.html',
  standalone: true,
})
export class PropertyLocationPicker implements OnDestroy {
  lat = input.required<number>();
  lng = input.required<number>();
  locationSelected = output<{ lat: number; lng: number }>();

  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private map?: L.Map;
  private marker?: L.Marker;
  private resizeObserver?: ResizeObserver;

  constructor() {
    // afterNextRender corre una sola vez, después de que Angular ya pintó
    // el DOM por primera vez. Leaflet necesita el <div> ya existente en
    // el documento para poder inicializarse ahí adentro.
    afterNextRender(() => this.initMap());

    // Si lat/lng cambian desde AFUERA del mapa (ej. el usuario tipeó a
    // mano en los inputs de latitud/longitud del form), movemos el
    // marcador para que el mapa refleje ese valor.
    effect(() => {
      const currentLat = this.lat() || DEFAULT_LAT;
      const currentLng = this.lng() || DEFAULT_LNG;
      this.marker?.setLatLng([currentLat, currentLng]);
    });
  }

  private initMap(): void {
    const initialLat = this.lat() || DEFAULT_LAT;
    const initialLng = this.lng() || DEFAULT_LNG;

    this.map = L.map(this.mapContainer().nativeElement).setView([initialLat, initialLng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => this.emitCurrentMarkerPosition());

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.marker?.setLatLng(event.latlng);
      this.emitCurrentMarkerPosition();
    });

    // EL BUG DE LOS TILES CORTADOS: Leaflet calcula su tamaño en píxeles
    // en el momento exacto en que se crea (L.map(...)). Si en ESE momento
    // el <div> todavía no terminó de acomodarse (porque el layout de
    // Angular/Material — mat-card, flexbox, fuentes cargando — sigue
    // moviendo cosas un instante más), el mapa queda calculado con un
    // tamaño viejo y se ve cortado hasta que vuelvas a interactuar.
    //
    // La solución robusta no es un setTimeout a ciegas (¿cuánto esperar?
    // nunca se sabe con certeza) — es un ResizeObserver: cada vez que el
    // contenedor CAMBIA de tamaño de verdad (layout, resize de ventana,
    // rotar el celular), le decimos a Leaflet "recalculá tu tamaño".
    // Guard: el entorno de tests (y algún navegador viejo) puede no tener
    // ResizeObserver. Sin este chequeo, initMap() explotaría ahí siempre.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(this.mapContainer().nativeElement);
    }
  }

  private emitCurrentMarkerPosition(): void {
    const position = this.marker?.getLatLng();
    if (position) {
      this.locationSelected.emit({ lat: position.lat, lng: position.lng });
    }
  }

  ngOnDestroy(): void {
    // Sin esto, el mapa y el observer seguirían vivos en memoria después
    // de que Angular destruya el componente (ej. al navegar a otra
    // pantalla) — un "memory leak" clásico con librerías imperativas.
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }
}
