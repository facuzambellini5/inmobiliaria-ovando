import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

/** Un link de navegación genérico: texto + a dónde va. */
export interface HeaderLink {
  label: string;
  path: string;
}

/**
 * Header único para todo el sitio (público y admin). Antes cada shell
 * tenía su propio header con estilos distintos (uno con <header> a mano,
 * el otro con mat-toolbar); esto los unifica en un solo lugar, así un
 * cambio visual futuro (logo, colores, etc.) se hace acá una sola vez.
 *
 * Lo que cambia entre público y admin no es el look, es SOLO el contenido:
 * qué links mostrar (`links`) y si hace falta el botón de salir
 * (`showLogout` + evento `logout`). Por eso no se usa content projection
 * (ng-content) — con inputs/outputs alcanza y es más simple de leer.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, MatButtonModule],
  styleUrl: './site-header.scss',
  templateUrl: './site-header.html',
})
export class SiteHeader {
  private readonly router = inject(Router);

  links = input<HeaderLink[]>([]);
  showLogout = input(false);
  logout = output<void>();

  /**
   * El logo siempre apunta a "/". Si ya estás ahí, Angular no "navega"
   * a ningún lado porque ya es la ruta actual — clickear el logo no
   * hacía nada. En vez de eso, si ya estás en "/" hacemos scroll suave
   * hasta arriba, que es lo que la gente espera al tocar el logo.
   *
   * Si estás en OTRA ruta (ej. /propiedades o /admin/propiedades), no
   * tocamos nada acá: dejamos que el routerLink navegue normal a "/".
   */
  protected onBrandClick(event: MouseEvent): void {
    // Click derecho, o click con Ctrl/Cmd/Shift/Alt (abrir en pestaña
    // nueva, etc.) lo maneja el navegador solo — no nos metemos.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }

    if (this.router.url.split('?')[0].split('#')[0] === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
