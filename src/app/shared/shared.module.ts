import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';

@NgModule({
  declarations: [StatsCardComponent, StatusBadgeComponent],
  imports: [CommonModule, RouterModule],
  exports: [StatsCardComponent, StatusBadgeComponent],
})
export class SharedModule {}
