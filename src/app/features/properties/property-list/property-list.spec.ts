import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PropertyList } from './property-list';

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

    // httpResource dispara el GET apenas se crea el componente; le
    // contestamos a mano con una página vacía para que el test no se
    // quede esperando una respuesta real que nunca va a llegar.
    const req = httpMock.expectOne((r) => r.url.endsWith('/properties'));
    req.flush({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
    });

    await fixture.whenStable();
  });

  afterEach(() => {
    // Verifica que no haya quedado ningún request sin responder.
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
