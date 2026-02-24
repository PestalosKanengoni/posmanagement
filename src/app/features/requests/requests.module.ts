import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RequestsComponent } from './requests.component';
import { ConfigModalComponent } from '../config-modal/config-modal.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: RequestsComponent }];

@NgModule({
  declarations: [RequestsComponent, ConfigModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class RequestsModule {}
