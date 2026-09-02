import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyStatusMenu } from './property-status-menu';

describe('PropertyStatusMenu', () => {
  let component: PropertyStatusMenu;
  let fixture: ComponentFixture<PropertyStatusMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyStatusMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyStatusMenu);
    fixture.componentRef.setInput('currentStatus', 'DISPONIBLE');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no ofrece el estado actual como opción', () => {
    expect(component['otherStatuses']).toEqual(['ALQUILADA', 'VENDIDA']);
  });
});
