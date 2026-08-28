import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { PropertyList } from './features/properties/property-list/property-list';
import { AdminShell } from './core/layout/admin-shell/admin-shell';

export const routes: Routes = [
  { path: 'login', component: Login },

  // Este redirect va ANTES que la ruta del shell, y a propósito: con
  // pathMatch: 'full', solo aplica cuando la URL es EXACTAMENTE '/' (cero
  // segmentos). Si fuera después del shell, nunca se alcanzaría — el shell
  // (más abajo) matchea '/' igual, como prefijo, así que "ganaría" primero.
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // AdminShell tiene path: '' — no agrega ningún segmento a la URL, solo
  // envuelve a sus rutas hijas con la barra de arriba (logo + Salir).
  {
    path: '',
    component: AdminShell,
    children: [{ path: 'propiedades', component: PropertyList }],
  },

  { path: '**', redirectTo: 'login' },
];
