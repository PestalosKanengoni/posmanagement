import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.dismiss(toast.id)">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-wrap {
      position: fixed; bottom: 24px; right: 24px; z-index: 300;
      display: flex; flex-direction: column; gap: 10px;
    }
    .toast {
      background: var(--surface); border: 1px solid var(--border);
      border-left: 3px solid var(--success); border-radius: 4px;
      padding: 12px 18px; font-family: var(--mono); font-size: 12px;
      color: var(--text); animation: slideInRight 0.25s ease;
      min-width: 260px; cursor: pointer;
    }
    .toast.warn   { border-left-color: var(--warn); }
    .toast.danger { border-left-color: var(--danger); }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
