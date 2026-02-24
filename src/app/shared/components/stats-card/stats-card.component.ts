import { Component, Input } from '@angular/core';

export type StatVariant = 'total' | 'pending' | 'configured' | 'deployed';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss'],
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() hint = '';
  @Input() variant: StatVariant = 'total';
}
