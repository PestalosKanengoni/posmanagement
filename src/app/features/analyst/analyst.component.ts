import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ToastService } from "src/app/core/services/toast.service";
import {
  PosApplication,
  Account,
  ChargeCode
} from "src/app/core/models/teller.model";
import { AuthService } from "src/app/core/services/auth.service";
import { MerchantAnalystService } from "src/app/core/services/analyst.service";
import { RouterModule } from "@angular/router";


@Component({
  selector: "app-merchant-analyst",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./analyst.component.html",
  styleUrl: "./analyst.component.css"
})
export class MerchantAnalystComponent implements OnInit {

  currentUser = this.auth.currentUser;

  applications   = signal<PosApplication[]>([]);
  isLoading      = signal(true);
  isSubmitting   = signal(false);
  errorMessage   = signal("");
  expandedIndex  = signal<number | null>(null);
  remarksMap     = signal<Map<string, string>>(new Map());
  activeFilter   = signal<'PENDING' | 'ALL'>('PENDING');
  pageSize       = 4;
  currentPage    = signal(1);

  constructor(
    private msaService: MerchantAnalystService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  // ── Data ───────────────────────────────────────────────────────
  loadApplications(): void {
    this.isLoading.set(true);
    this.currentPage.set(1);
    this.errorMessage.set("");

    const request$ = this.activeFilter() === 'ALL'
      ? this.msaService.getAllApplications()
      : this.msaService.getApplications();

    request$.subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.responseCode === "000") {
          this.applications.set(res.data);
        } else {
          this.errorMessage.set(res.responseDescription || "Failed to load applications");
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.responseDescription || "Unable to load applications");
      }
    });
  }

  // ── Filter & Pagination ────────────────────────────────────────
  setFilter(filter: 'PENDING' | 'ALL'): void {
    this.activeFilter.set(filter);
    this.loadApplications();
  }

  get pagedApplications(): PosApplication[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.applications().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.applications().length / this.pageSize);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
      this.expandedIndex.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Expand / collapse ──────────────────────────────────────────
  toggleExpand(pagedIndex: number, appId: string): void {
    this.expandedIndex.set(this.expandedIndex() === pagedIndex ? null : pagedIndex);
    if (!this.remarksMap().has(appId)) {
      const updated = new Map(this.remarksMap());
      updated.set(appId, "");
      this.remarksMap.set(updated);
    }
  }

  // ── Remarks ───────────────────────────────────────────────────
  getRemarks(appId: string): string {
    return this.remarksMap().get(appId) ?? "";
  }

  updateRemarks(appId: string, value: string): void {
    const updated = new Map(this.remarksMap());
    updated.set(appId, value);
    this.remarksMap.set(updated);
  }

  // ── Action ─────────────────────────────────────────────────────
 action(pagedIndex: number): void {
  const app = this.pagedApplications[pagedIndex];
  if (!app) return;

  const payload = {
    remarks: this.getRemarks(app.id),
    status: "APPROVED",
    applicationId: app.id,
    chargeCodes: this.getAllChargeCodes(app)
  };

  this.isSubmitting.set(true);

  this.msaService.actionApplication(payload).subscribe({
    next: (res: any) => {
      this.isSubmitting.set(false);

      if (res.responseCode !== "000") {
        this.toast.show(res.responseDescription || "Action failed. Try again.", "warn");
        return;
      }

      this.toast.show("Application actioned successfully");
      this.applications.update(list => list.filter(a => a.id !== app.id));

      if (this.pagedApplications.length === 0 && this.currentPage() > 1) {
        this.setPage(this.currentPage() - 1);
      }
      this.expandedIndex.set(null);
    },
    error: (err) => {
      this.isSubmitting.set(false);
      this.toast.show(err.error?.responseDescription || "Action failed. Try again.", "warn");
    }
  });
}

  // ── Status helpers ─────────────────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'AWAITING_TELLER_APPROVAL':
      case 'AWAITING_BM_APPROVAL':
      case 'AWAITING_MSA_ACTIONING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
      case 'DECLINED':
        return 'status-rejected';
      case 'ACTIONED':
        return 'status-actioned';
      default:
        return 'status-default';
    }
  }

  transformStatus(status: string): string {
    if (!status) return 'N/A';
    return status
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  isFinalized(status: string): boolean {
    return ['APPROVED', 'REJECTED', 'DECLINED', 'ACTIONED',
      'AWAITING_TELLER_APPROVAL', 'AWAITING_BM_APPROVAL'].includes(status);
  }

  // ── Template helpers ───────────────────────────────────────────
  getUniqueTrades(app: PosApplication): string {
    return [...new Set(app.requests.map(r => r.tradeName))].join(", ");
  }

  getUniqueCategories(app: PosApplication): string {
    return [...new Set(app.requests.map(r => r.category.description))].join(" · ");
  }

  getUniqueLocations(app: PosApplication): string {
    return [...new Set(app.requests.map(r => r.location))].join(", ");
  }

  getUniqueAccounts(app: any): Account[] {
    const allAccounts: Account[] = app.requests.flatMap((req: any) => req.accounts || []);
    const uniqueMap = new Map<string, Account>();
    allAccounts.forEach(acc => {
      if (acc?.accountNumber) uniqueMap.set(acc.accountNumber, acc);
    });
    return Array.from(uniqueMap.values());
  }

  getAllChargeCodes(app: PosApplication): any[] {
    const allCodes = app.requests.flatMap(req => (req as any).chargeCodes || []);
    return [...new Map(allCodes.map((c: any) => [c.id, c])).values()];
  }

  getCurrencyColor(currency: string): string {
    const map: Record<string, string> = {
      USD:  "chip-usd",
      ZWG:  "chip-zwg",
      BOTH: "chip-multi"
    };
    return map[currency] ?? "chip-usd";
  }

  onLogout(): void {
    this.auth.logout();
  }
}