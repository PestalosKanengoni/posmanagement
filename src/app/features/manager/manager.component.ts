import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ToastService } from "src/app/core/services/toast.service";
import {
  PosApplication,
  AuthorisePayload,
  Account,
  ChargeCode
} from "src/app/core/models/teller.model";
import { TellerService } from "src/app/core/services/teller.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ManagerService } from "src/app/core/services/manager.service";

interface ManagerSelectionState {
  remarks: string;
}

interface SelectionState {
  selectedCodes: ChargeCode[];
  remarks: string;
}

@Component({
  selector: "app-manager",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./manager.component.html",
  styleUrl: "./manager.component.css"
})
export class ManagerComponent implements OnInit {

  currentUser = this.auth.currentUser;

  // ── State ──────────────────────────────────────────────────────
  applications  = signal<PosApplication[]>([]);
  isLoading     = signal(true);
  isSubmitting  = signal(false);
  errorMessage  = signal("");
  expandedIndex = signal<number | null>(null);
  selectionMap = signal<Map<string, SelectionState>>(new Map());
  activeFilter = signal<'PENDING' | 'ALL'>('PENDING');
  pageSize = 4;
  currentPage = signal(1);

  constructor(
    private managerService: ManagerService,
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
    ? this.managerService.getAllApplications()
    : this.managerService.getApplications();

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

    // this.managerService.getApplications().subscribe({
    //   next: (res) => {
    //     this.isLoading.set(false);
    //     if (res.responseCode === "000") {
    //       this.applications.set(
    //         res.data.filter(a => a.approvalStatus === "AWAITING_BM_APPROVAL")
    //       );
    //     } else {
    //       this.errorMessage.set(res.responseDescription || "Failed to load applications");
    //     }
    //   },
    //   error: (err) => {
    //     this.isLoading.set(false);
    //     this.errorMessage.set(err.error?.responseDescription || "Unable to load applications");
    //   }
    // });
  }

  getStatusClass(status: string): string {
  switch (status) {
    case 'AWAITING_TELLER_APPROVAL':
    case 'AWAITING_BM_APPROVAL':
      return 'status-pending';
    case 'APPROVED':
      return 'status-approved';
    case 'REJECTED':
    case 'DECLINED':
      return 'status-rejected';
    default:
      return 'status-default';
  }
}

transformStatus(status: string): string {
  if (!status) return 'N/A';
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  get pagedApplications(): PosApplication[] {
  const startIndex = (this.currentPage() - 1) * this.pageSize;
  return this.applications().slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.applications().length / this.pageSize);
}

// ── Logic ─────────────────────────────────────────────────────
setPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage.set(page);
    this.expandedIndex.set(null); // Collapse any open cards when switching pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

  setFilter(filter: 'PENDING' | 'ALL'): void {
  this.activeFilter.set(filter);
  this.loadApplications();
}

  // ── Expand / collapse ──────────────────────────────────────────
  // toggleExpand(index: number): void {
  //   this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  //   this.ensureRemarks(index);
  // }

  toggleExpand(pagedIndex: number, appId: string): void {
  // We keep expandedIndex as the visual index (0-4) for the accordion effect
  this.expandedIndex.set(this.expandedIndex() === pagedIndex ? null : pagedIndex);
  this.ensureSelection(appId);
}
  // private ensureRemarks(index: number): void {
  //   if (!this.remarksMap().has(index)) {
  //     this.remarksMap.set(new Map(this.remarksMap()).set(index, { remarks: "" }));
  //   }
  // }

  private ensureSelection(appId: string): void {
  if (!this.selectionMap().has(appId)) {
    const updated = new Map(this.selectionMap());
    updated.set(appId, { selectedCodes: [], remarks: "" });
    this.selectionMap.set(updated);
    // this.selectionMap.set(
    //   new Map(this.selectionMap()).set(index, { selectedCodes: [], remarks: "" })
    // );
  }
}

  // ── Remarks ───────────────────────────────────────────────────
  // getRemarks(index: number): string {
  //   return this.remarksMap().get(index)?.remarks ?? "";
  // }

    getRemarks(appId: string): string {
    return this.selectionMap().get(appId)?.remarks ?? "";
  }

  // updateRemarks(index: number, value: string): void {
  //   const updated = new Map(this.remarksMap());
  //   updated.set(index, { remarks: value });
  //   this.remarksMap.set(updated);
  // }

  updateRemarks(appId: string, value: string): void {
  const sel = this.getSelection(appId);
  const updated = new Map(this.selectionMap());
  updated.set(appId, { ...sel, remarks: value });
  this.selectionMap.set(updated);
}

  // ── Authorise / Decline ────────────────────────────────────────
  authorise(pagedIndex: number, status: "APPROVED" | "REJECTED"): void {
    // const app = this.applications()[index];
    // const remarks = this.getRemarks(index);

    const app = this.pagedApplications[pagedIndex];
      if (!app) return;

      const selection = this.getSelection(app.id);
    const remarks = selection.remarks;

    if (status === "REJECTED" && !remarks.trim()) {
    this.toast.show("Please add a remark before declining.", "warn");
    return;
  }

    const payload: AuthorisePayload = {
      remarks,  
      status,
      applicationId: app.id,
      chargeCodes:   []
    };

  

    this.isSubmitting.set(true);

    this.managerService.authorise(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show(`Application ${status === "APPROVED" ? "approved" : "rejected"} successfully`);

        this.applications.update(list => list.filter(a => a.id !== app.id));
        // this.applications.update(list => list.filter((_, i) => i !== index));

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

    getSelection(appId: string): SelectionState {
  return this.selectionMap().get(appId)?? { selectedCodes: [], remarks: "" };
}

 canDecline(appId: string): boolean {
  return !!this.getRemarks(appId).trim();
}

//   canDecline(index: number): boolean {
//   return !!this.getRemarks(index).trim();
// }

// private ensureSelection(appId: string): void {
//   if (!this.selectionMap().has(appId)) {
//     const updated = new Map(this.selectionMap());
//     updated.set(appId, { selectedCodes: [], remarks: "" });
//     this.selectionMap.set(updated);
//     // this.selectionMap.set(
//     //   new Map(this.selectionMap()).set(index, { selectedCodes: [], remarks: "" })
//     // );
//   }
// }

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

  // Inside ManagerComponent class
getUniqueAccounts(app: any): Account[] {
  // 1. Gather all accounts from all requests
  const allAccounts: Account[] = app.requests.flatMap((req: any) => req.accounts || []);
  
  // 2. Filter out any null/undefined entries and ensure uniqueness by accountNumber
  const uniqueMap = new Map<string, Account>();
  
  allAccounts.forEach(acc => {
    if (acc && acc.accountNumber) {
      uniqueMap.set(acc.accountNumber, acc);
    }
  });

  // 3. Return as a clean array
  return Array.from(uniqueMap.values());
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

  // Inside ManagerComponent class
getAllChargeCodes(app: PosApplication): any[] {
  // Flattens all chargeCodes from all requests into one unique list
  const allCodes = app.requests.flatMap(req => req.chargeCodes || []);
  // Filter by ID to ensure uniqueness if the same code is on multiple requests
  return [...new Map(allCodes.map(c => [c.id, c])).values()];
}

isFinalized(status: string): boolean {
  return ['APPROVED', 'REJECTED', 'DECLINED','AWAITING_TELLER_APPROVAL', 
    'AWAITING_MSA_ACTIONING'].includes(status);
}

}