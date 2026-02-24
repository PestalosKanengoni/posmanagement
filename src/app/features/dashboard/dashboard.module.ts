import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { RequestsModule } from '../requests/requests.module';
import { MachinesModule } from '../machines/machines.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'requests', pathMatch: 'full' },
      {
        path: 'requests',
        loadChildren: () =>
          import('../requests/requests.module').then((m) => m.RequestsModule),
      },
      {
        path: 'machines',
        loadChildren: () =>
          import('../machines/machines.module').then((m) => m.MachinesModule),
      },
    ],
  },
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class DashboardModule {}
