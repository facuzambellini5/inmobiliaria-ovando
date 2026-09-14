import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PropertyList } from './property-list';

const EMPTY_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
};

describe('PropertyList', () => {
  let component: PropertyList;
  let fixture: ComponentFixture<PropertyList>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PropertyList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Cada pestaña (Disponibles/Alquiladas/Vendidas) dispara su propio GET
    // a /properties/status apenas se crea el componente — le contestamos
    // a las tres con una página vacía para que ningún test se quede
    // esperando una respuesta que nunca llega.
    httpMock
      .match((r) => r.url.endsWith('/properties/status'))
      .forEach((req) => req.flush(EMPTY_PAGE));

    await fixture.whenStable();
  });

  afterEach(() => {
    // Verifica que no haya quedado ningún request sin responder.
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pide cada pestaña con su propio status, page y size', async () => {
    // El signal de página de "Vendidas" cambia; eso debería disparar UN
    // solo pedido nuevo, con status=VENDIDA y page=1 — sin tocar las
    // otras dos pestañas.
    component['soldPage'].set(1);
    // TestBed.tick() corre los efectos pendientes de forma síncrona, sin
    // esperar a que el pedido HTTP se resuelva (todavía no lo
    // flusheamos) — `await fixture.whenStable()` acá se quedaría
    // esperando para siempre.
    TestBed.tick();

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/properties/status') && r.params.get('status') === 'VENDIDA',
    );
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(EMPTY_PAGE);
    await fixture.whenStable();
  });

  it('al cambiar el estado de una propiedad, vuelve a la página 1 en las tres pestañas', async () => {
    component['availablePage'].set(2);
    TestBed.tick();
    httpMock
      .expectOne((r) => r.url.endsWith('/properties/status') && r.params.get('page') === '2')
      .flush(EMPTY_PAGE);
    await fixture.whenStable();

    component['onStatusChange']({
      property: {
        id: '1',
        title: 'Casa',
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
      },
      newStatus: 'VENDIDA',
    });
    await fixture.whenStable();

    // El PUT de actualización de la propiedad.
    httpMock.expectOne((r) => r.url.endsWith('/properties/1')).flush({});
    await fixture.whenStable();
    TestBed.tick();

    // Las tres pestañas vuelven a pedirse desde la página 1 (page=0).
    httpMock
      .match((r) => r.url.endsWith('/properties/status'))
      .forEach((req) => {
        expect(req.request.params.get('page')).toBe('0');
        req.flush(EMPTY_PAGE);
      });
    await fixture.whenStable();

    expect(component['availablePage']()).toBe(0);
  });
});
