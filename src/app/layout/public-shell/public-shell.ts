import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderLink, SiteHeader } from '../site-header/site-header';

@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, SiteHeader],
  styleUrl: './public-shell.scss',
  templateUrl: './public-shell.html',
  standalone: true,
})
export class PublicShell {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly headerLinks: HeaderLink[] = [
    { label: 'Propiedades', path: '/propiedades' },
    { label: 'Admin', path: '/admin' },
  ];
}
