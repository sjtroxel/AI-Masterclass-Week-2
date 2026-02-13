import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { noAuthGuard } from './core/no-auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((c) => c.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((c) => c.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup').then((c) => c.SignupComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
