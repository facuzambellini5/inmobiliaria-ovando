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

  protected scrollToProperties(event: Event): void {
    event.preventDefault();
    this.viewportScroller.scrollToAnchor('propiedades', { behavior: 'smooth' });
  }
}
