import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyPhotos } from './property-photos';

describe('PropertyPhotos', () => {
  let component: PropertyPhotos;
  let fixture: ComponentFixture<PropertyPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyPhotos],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyPhotos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
