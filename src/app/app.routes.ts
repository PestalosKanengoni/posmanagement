
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: "teller",
    canActivate: [authGuard],
    loadComponent: () => import('./features/teller/teller.component').then(m => m.TellerComponent)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
