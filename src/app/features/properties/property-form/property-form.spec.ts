import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PropertyForm } from './property-form';

describe('PropertyForm', () => {
  let fixture: ComponentFixture<PropertyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyForm);
    await fixture.whenStable();
  });

  it('should create (modo alta, sin :id en la ruta)', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance['isEditMode']).toBe(false);
  });
});
