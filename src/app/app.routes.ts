import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { NgModule } from '@angular/core';

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
  { path: 'analyst',
    canActivate: [authGuard],
     loadComponent: () => import('./features/analyst/analyst.component').then(m=> m.MerchantAnalystComponent) },

  { path: 'manager',
    canActivate: [authGuard],
     loadComponent: () => import('./features/manager/manager.component').then(m=> m.ManagerComponent) },
  { path: 'pending-linking',
    canActivate: [authGuard],
     loadComponent: () => import('./features/linking/pending-linking.component').then(m=> m.PendingLinkingComponent) },
     { 
  path: 'devices',
  canActivate: [authGuard],
  loadComponent: () => import('./features/devices/devices.component').then(m => m.DevicesComponent) 
},
  {
    
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
