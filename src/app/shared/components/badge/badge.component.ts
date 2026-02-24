import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PosStatus } from "../../../core/models/pos-machine.model";

@Component({
  selector: "app-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badge" [class]="status">
      <div class="badge-dot"></div>
      {{ labels[status] }}
    </div>
  `,
  styles: [`
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 3px;
      font-family: var(--mono); font-size: 10px;
      letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; }
    .pending { background: rgba(245,158,11,0.12); color: var(--warn); }
    .pending .badge-dot { background: var(--warn); animation: pulse 1.5s infinite; }
    .configured { background: rgba(0,136,255,0.12); color: var(--accent2); }
    .configured .badge-dot { background: var(--accent2); }
    .deployed { background: rgba(16,185,129,0.12); color: var(--success); }
    .deployed .badge-dot { background: var(--success); }
  `]
})
export class BadgeComponent {
  @Input() status!: PosStatus;
  labels: Record<PosStatus, string> = {
    pending: "Pending",
    configured: "Configured",
    deployed: "Deployed"
  };
}
