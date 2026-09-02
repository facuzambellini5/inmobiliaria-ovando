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
    fixture.componentRef.setInput('lat', -27.4512);
    fixture.componentRef.setInput('lng', -58.9866);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
