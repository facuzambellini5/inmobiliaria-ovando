import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Page, PropertyResponse } from '../../core/models/property.model';
import { PropertyBrowser } from './property-browser';

const DISPONIBLE: PropertyResponse = {
  id: '1',
  title: 'Casa disponible',
  description: '',
  type: 'CASA',
  operation: 'VENTA',
  salePrice: 100000,
  currency: 'USD',
  address: 'Calle 1',
  zone: 'CENTRO',
  lat: 0,
  lng: 0,
  status: 'DISPONIBLE',
  hasGarage: false,
  hasPatio: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  images: [],
};

// Arma una respuesta Page<T> completa, como la que devuelve Spring, para
// no repetir los 8 campos en cada test — solo se pisa lo que a cada test
// le importa (content, totalElements, totalPages).
function pageOf(overrides: Partial<Page<PropertyResponse>>): Page<PropertyResponse> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 12,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true,
    ...overrides,
  };
}

describe('PropertyBrowser', () => {
  let component: PropertyBrowser;
  let fixture: ComponentFixture<PropertyBrowser>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyBrowser],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PropertyBrowser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('pide siempre status=DISPONIBLE: el sitio público nunca debe filtrar vendidas/alquiladas del lado del cliente', async () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/properties'));

    expect(req.request.params.get('status')).toBe('DISPONIBLE');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('12');

    req.flush(
      pageOf({ content: [DISPONIBLE], totalElements: 1, totalPages: 1, numberOfElements: 1 }),
    );
    await fixture.whenStable();

    expect(component['items']()).toEqual([DISPONIBLE]);
    expect(component['totalElements']()).toBe(1);
  });

  it('manda tipo/operación/zona/precio como query params al backend, no filtra en el cliente', async () => {
    httpMock.expectOne((r) => r.url.endsWith('/properties')).flush(pageOf({}));
    await fixture.whenStable();

    component['onFiltersChange']({
      type: 'DEPARTAMENTO',
      operation: 'VENTA',
      zone: 'CENTRO',
      minPrice: 1000,
      maxPrice: 5000,
    });
    // TestBed.tick() corre los efectos pendientes de forma síncrona (sin
    // esto, httpResource todavía no se enteró de que cambió el filtro y
    // el request nuevo ni se llegó a disparar). NO usamos
    // `await fixture.whenStable()` acá: esa función espera a que la
    // tarea pendiente (el pedido HTTP) TERMINE, y todavía no la
    // flusheamos — quedaría esperando para siempre.
    TestBed.tick();

    const req = httpMock.expectOne((r) => r.url.endsWith('/properties'));
    expect(req.request.params.get('type')).toBe('DEPARTAMENTO');
    expect(req.request.params.get('operation')).toBe('VENTA');
    expect(req.request.params.get('zone')).toBe('CENTRO');
    expect(req.request.params.get('minPrice')).toBe('1000');
    expect(req.request.params.get('maxPrice')).toBe('5000');
    req.flush(pageOf({}));
    await fixture.whenStable();
  });

  it('al cambiar de filtro vuelve a la página 1, para no quedar parado en una página que ya no existe', async () => {
    httpMock.expectOne((r) => r.url.endsWith('/properties')).flush(pageOf({}));
    await fixture.whenStable();

    component['onPageChange'](3);
    TestBed.tick();
    httpMock.expectOne((r) => r.params.get('page') === '3').flush(pageOf({}));
    await fixture.whenStable();

    component['onFiltersChange']({
      type: 'DEPARTAMENTO',
      operation: '',
      zone: '',
      minPrice: null,
      maxPrice: null,
    });
    TestBed.tick();

    const req = httpMock.expectOne((r) => r.url.endsWith('/properties'));
    expect(req.request.params.get('page')).toBe('0');
    req.flush(pageOf({}));
    await fixture.whenStable();
  });

  it('cambiar de página pide esa página puntual al backend', async () => {
    httpMock.expectOne((r) => r.url.endsWith('/properties')).flush(pageOf({}));
    await fixture.whenStable();

    component['onPageChange'](2);
    TestBed.tick();

    const req = httpMock.expectOne((r) => r.url.endsWith('/properties'));
    expect(req.request.params.get('page')).toBe('2');
    req.flush(pageOf({ number: 2 }));
    await fixture.whenStable();
  });
});
