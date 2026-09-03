import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PropertyResponse } from '../../../core/models/property.model';
import { PropertyCard } from './property-card';

const SAMPLE_PROPERTY: PropertyResponse = {
  id: 'abc-123',
  title: 'Depto en el centro',
  description: 'Luminoso, a estrenar',
  type: 'DEPARTAMENTO',
  operation: 'ALQUILER',
  rentPrice: 300000,
  currency: 'ARS',
  address: 'San Martín 1171',
  zone: 'CENTRO',
  lat: -27.45,
  lng: -58.98,
  status: 'DISPONIBLE',
  bedrooms: 1,
  bathrooms: 1,
  hasGarage: false,
  hasPatio: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  images: [],
};

describe('PropertyCard', () => {
  let component: PropertyCard;
  let fixture: ComponentFixture<PropertyCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCard);
    fixture.componentRef.setInput('property', SAMPLE_PROPERTY);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
