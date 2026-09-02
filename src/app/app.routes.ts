import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: 'propiedades',
        loadComponent: () =>
          import('./features/properties/property-list/property-list').then((m) => m.PropertyList),
      },
      {
        path: 'propiedades/nueva',
        loadComponent: () =>
          import('./features/properties/property-form/property-form').then((m) => m.PropertyForm),
      },
      {
        path: 'propiedades/:id/editar',
        loadComponent: () =>
          import('./features/properties/property-form/property-form').then((m) => m.PropertyForm),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
