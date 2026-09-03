import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyFilters } from './property-filters';

describe('PropertyFilters', () => {
  let component: PropertyFilters;
  let fixture: ComponentFixture<PropertyFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('al elegir un tipo, emite el objeto de filtros completo', () => {
    const emitted: unknown[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component['onTypeChange']('CASA');

    expect(emitted).toEqual([
      { type: 'CASA', operation: '', zone: '', minPrice: null, maxPrice: null },
    ]);
  });

  it('Limpiar resetea todos los campos y emite el estado vacío', () => {
    component['onTypeChange']('CASA');
    component['onMinPriceChange']('1000');

    const emitted: unknown[] = [];
    component.filtersChange.subscribe((value) => emitted.push(value));

    component['onClear']();

    expect(emitted).toEqual([
      { type: '', operation: '', zone: '', minPrice: null, maxPrice: null },
    ]);
  });
});
