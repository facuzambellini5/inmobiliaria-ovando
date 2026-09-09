import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { HeaderLink, SiteHeader } from '../site-header/site-header';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, SiteHeader],
  styleUrl: './admin-shell.scss',
  templateUrl: './admin-shell.html',
})
export class AdminShell {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // "Ver sitio" se sacó de acá: el logo del header (compartido con el
  // sitio público) ya lleva a "/", así que era un link redundante.
  protected readonly headerLinks: HeaderLink[] = [
    { label: 'Propiedades', path: '/admin/propiedades' },
  ];

  protected onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
