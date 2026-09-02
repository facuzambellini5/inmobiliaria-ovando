import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyLocationPicker } from './property-location-picker';

describe('PropertyLocationPicker', () => {
  let component: PropertyLocationPicker;
  let fixture: ComponentFixture<PropertyLocationPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyLocationPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyLocationPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
