import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  { path: 'admin', redirectTo: 'admin/login', pathMatch: 'full' },
  {
    path: 'admin',
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
  { path: '**', redirectTo: '' },
];
