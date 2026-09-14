import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;
  let component: Pagination;

  async function setup(inputs: {
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  }): Promise<void> {
    await TestBed.configureTestingModule({ imports: [Pagination] }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('page', inputs.page);
    fixture.componentRef.setInput('totalPages', inputs.totalPages);
    fixture.componentRef.setInput('totalElements', inputs.totalElements);
    fixture.componentRef.setInput('pageSize', inputs.pageSize);
    fixture.detectChanges();
  }

  // En vez de un mock/spy, nos suscribimos al output tal cual lo haría
  // cualquier componente padre real, y guardamos lo último que emitió.
  function captureEmittedPage(): { value: number | undefined } {
    const captured: { value: number | undefined } = { value: undefined };
    component.pageChange.subscribe((page) => (captured.value = page));
    return captured;
  }

  it('no emite nada al tocar "anterior" estando en la primera página', async () => {
    await setup({ page: 0, totalPages: 3, totalElements: 30, pageSize: 10 });
    const emitted = captureEmittedPage();

    component['previous']();

    expect(emitted.value).toBeUndefined();
  });

  it('emite la página siguiente al tocar "siguiente"', async () => {
    await setup({ page: 0, totalPages: 3, totalElements: 30, pageSize: 10 });
    const emitted = captureEmittedPage();

    component['next']();

    expect(emitted.value).toBe(1);
  });

  it('no emite nada al tocar "siguiente" estando en la última página', async () => {
    await setup({ page: 2, totalPages: 3, totalElements: 30, pageSize: 10 });
    const emitted = captureEmittedPage();

    component['next']();

    expect(emitted.value).toBeUndefined();
  });

  it('emite la página elegida al tocar un número de página puntual', async () => {
    await setup({ page: 0, totalPages: 5, totalElements: 50, pageSize: 10 });
    const emitted = captureEmittedPage();

    component['goTo'](3);

    expect(emitted.value).toBe(3);
  });

  it('calcula el rango "mostrando X–Y de Z" para una página del medio', async () => {
    await setup({ page: 1, totalPages: 3, totalElements: 25, pageSize: 10 });

    expect(component['rangeStart']()).toBe(11);
    expect(component['rangeEnd']()).toBe(20);
  });

  it('recorta el rango final al total real en la última página incompleta', async () => {
    await setup({ page: 2, totalPages: 3, totalElements: 25, pageSize: 10 });

    expect(component['rangeStart']()).toBe(21);
    expect(component['rangeEnd']()).toBe(25); // no 30: solo hay 25 en total
  });

  it('muestra una ventana de páginas centrada en la actual cuando hay muchas', async () => {
    await setup({ page: 7, totalPages: 20, totalElements: 200, pageSize: 10 });

    expect(component['visiblePages']()).toEqual([5, 6, 7, 8, 9]);
  });

  it('muestra todas las páginas sin recortar cuando son pocas', async () => {
    await setup({ page: 0, totalPages: 3, totalElements: 30, pageSize: 10 });

    expect(component['visiblePages']()).toEqual([0, 1, 2]);
  });
});
