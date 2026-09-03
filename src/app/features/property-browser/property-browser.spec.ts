import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PropertyResponse } from '../../core/models/property.model';
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

const VENDIDA: PropertyResponse = {
  ...DISPONIBLE,
  id: '2',
  title: 'Casa vendida',
  status: 'VENDIDA',
};

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

    const req = httpMock.expectOne((r) => r.url.endsWith('/properties'));
    req.flush({
      content: [DISPONIBLE, VENDIDA],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 50,
      first: true,
      last: true,
      numberOfElements: 2,
      empty: false,
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('muestra solo las propiedades DISPONIBLE, nunca las vendidas/alquiladas', () => {
    expect(component['filteredProperties']()).toEqual([DISPONIBLE]);
  });

  it('aplica los filtros que emite PropertyFilters', () => {
    component['onFiltersChange']({
      type: 'DEPARTAMENTO',
      operation: '',
      zone: '',
      minPrice: null,
      maxPrice: null,
    });
    expect(component['filteredProperties']()).toEqual([]);
  });
});
