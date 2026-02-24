import { Component, Input } from '@angular/core';
import { PosStatus } from '../../../core/models/pos-machine.model';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() status: PosStatus = 'pending';

  get label(): string {
    return { pending: 'Pending', configured: 'Configured', deployed: 'Deployed' }[this.status];
  }
}
