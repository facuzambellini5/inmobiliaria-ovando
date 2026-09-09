import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicShell } from './public-shell';

describe('PublicShell', () => {
  let component: PublicShell;
  let fixture: ComponentFixture<PublicShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicShell],
      // Sin esto, Angular no encuentra un Router para resolver los
      // routerLink del header y falla al crear el componente.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
