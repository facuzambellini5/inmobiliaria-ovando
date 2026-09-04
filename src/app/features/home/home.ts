import { Component, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { PropertyBrowser } from '../property-browser/property-browser';

@Component({
  selector: 'app-home',
  imports: [PropertyBrowser],
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly viewportScroller = inject(ViewportScroller);

  // El botón del cover no navega a ninguna ruta nueva: las propiedades
  // ya están renderizadas más abajo en esta misma página, así que solo
  // hace scroll suave hasta ahí.
  protected scrollToProperties(event: Event): void {
    event.preventDefault();
    this.viewportScroller.scrollToAnchor('propiedades');
  }
}
