import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MachinesComponent } from './machines.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: MachinesComponent }];

@NgModule({
  declarations: [MachinesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class MachinesModule {}
