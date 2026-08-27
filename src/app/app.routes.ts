import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { PropertyList } from './features/properties/property-list/property-list';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'propiedades', component: PropertyList },

  // Sin guard todavía: cualquiera que sepa la URL /propiedades puede
  // entrar sin loguearse. Lo protegemos cuando armemos el guard de sesión.
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
