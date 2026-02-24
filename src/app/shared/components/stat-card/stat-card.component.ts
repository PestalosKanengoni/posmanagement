import { Component, Input } from "@angular/core";

@Component({
  selector: "app-stat-card",
  standalone: true,
  template: `
    <div class="stat-card" [class]="variant">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-hint">{{ hint }}</div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 4px; padding: 20px 22px; position: relative; overflow: hidden;
    }
    .stat-card::after {
      content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    }
    .total::after      { background: var(--accent2); }
    .pending::after    { background: var(--warn); }
    .configured::after { background: var(--accent2); }
    .deployed::after   { background: var(--success); }
    .stat-label {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px;
    }
    .stat-value { font-family: var(--mono); font-size: 36px; font-weight: 600; line-height: 1; margin-bottom: 4px; }
    .total .stat-value      { color: var(--accent2); }
    .pending .stat-value    { color: var(--warn); }
    .configured .stat-value { color: var(--accent2); }
    .deployed .stat-value   { color: var(--success); }
    .stat-hint { font-size: 11px; color: var(--text-dim); }
  `]
})
export class StatCardComponent {
  @Input() label = "";
  @Input() value: number = 0;
  @Input() hint = "";
  @Input() variant: "total" | "pending" | "configured" | "deployed" = "total";
}
