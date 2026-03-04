import { ChangeDetectorRef, Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ToastService } from "src/app/core/services/toast.service";
import {
  PosApplication,
  ChargeCode,
  AuthorisePayload
} from "src/app/core/models/teller.model";
import { TellerService } from "src/app/core/services/teller.service";
import { AuthService } from "src/app/core/services/auth.service";

interface SelectionState {
  selectedCodes: ChargeCode[];
  remarks: string;
}

@Component({
  selector: "app-teller",
  standalone: true,
  imports: [CommonModule, FormsModule],   // ShellComponent removed
  templateUrl: "./teller.component.html",
  styleUrl: "./teller.component.css"
})
export class TellerComponent implements OnInit {

  currentUser = this.auth.currentUser;

  // ── State ──────────────────────────────────────────────────────
  applications   = signal<PosApplication[]>([]);
  isLoading      = signal(true);
  isSubmitting   = signal(false);
  errorMessage   = signal("");
  expandedIndex  = signal<number | null>(null);
  selectionMap = signal<Map<string, SelectionState>>(new Map());
  activeFilter = signal<'PENDING' | 'ALL'>('PENDING');
  pageSize = 4 ;
  currentPage = signal(1);
  
  chargeCodes = signal<ChargeCode[]>([]);


  constructor(
    private tellerService: TellerService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadInitialData();
  }

  loadInitialData() {
  // Use forkJoin if you want to wait for both, 
  // or just call them separately for a faster initial paint
  this.tellerService.getChargeCodes().subscribe({
    next: (res) => this.chargeCodes.set(res.data),
    error: (err) => this.errorMessage.set('Failed to load charge codes')
  });
  
  this.loadApplications();
}

// ── Computed Data ─────────────────────────────────────────────
// This returns only the 5 records for the current view
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

  // ── Data ───────────────────────────────────────────────────────
  loadApplications(): void {
    this.isLoading.set(true);
    this.currentPage.set(1);
    this.errorMessage.set("");

    const request$ = this.activeFilter() === 'ALL'
    ? this.tellerService.getAllApplications()
    : this.tellerService.getApplications();

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

  setFilter(filter: 'PENDING' | 'ALL'): void {
  this.activeFilter.set(filter);
  this.loadApplications();
}

  getSelection(appId: string): SelectionState {
  return this.selectionMap().get(appId)?? { selectedCodes: [], remarks: "" };
}

// ✅ Ensures entry exists WITHOUT writing during template read
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

isCodeSelected(appId: string, code: ChargeCode): boolean {
  return this.getSelection(appId).selectedCodes.some(c => c.id === code.id);
}

  // ── Expand / collapse ──────────────────────────────────────────
// toggleExpand(index: number): void {
//   this.expandedIndex.set(this.expandedIndex() === index ? null : index);
//   this.ensureSelection(index); // ✅ write happens here, not in template
// }

toggleExpand(pagedIndex: number, appId: string): void {
  // We keep expandedIndex as the visual index (0-4) for the accordion effect
  this.expandedIndex.set(this.expandedIndex() === pagedIndex ? null : pagedIndex);
  this.ensureSelection(appId);
}


toggleCode(appId: string, code: ChargeCode): void {
  const sel = this.getSelection(appId);
  const updated = new Map(this.selectionMap());
  updated.set(appId, {
    ...sel,
    selectedCodes: sel.selectedCodes.filter(c => c.id !== code.id)
  });
  this.selectionMap.set(updated); // ✅ new Map reference triggers reactivity
}

  getFilteredCodes(app: PosApplication): ChargeCode[] {

    const allCodes = this.chargeCodes();
  if (!app) return allCodes;
  // const app = this.applications()[index];
  // const allCodes = this.chargeCodes(); // Get the current value of the signal
  
  // if (!app) return allCodes;

  // Check the requests within this specific application
  const categories = app.requests.map(r => r.category.name);
  const hasUSD  = categories.some(c => c.includes("USD"));
  const hasZWG  = categories.some(c => c.includes("ZWG"));
  const isMulti = categories.some(c => c.includes("MULTI")) || (hasUSD && hasZWG);

  if (isMulti) return allCodes;
  
  if (hasUSD)  return allCodes.filter(c => c.currency === "USD" || c.currency === "BOTH");
  if (hasZWG)  return allCodes.filter(c => c.currency === "ZWG" || c.currency === "BOTH");
  
  return allCodes;
}

  // canSubmit(index: number): boolean {
  //   return this.getSelection(index).selectedCodes.length > 0;
  // }

  getMissingCurrencies(app: PosApplication): string[] {
  const selected = this.getSelection(app.id).selectedCodes;
  const required = this.getRequiredCurrencies(app);

  return required.filter(currency =>
    !selected.some(c => c.currency === currency || c.currency === "BOTH")
  );
}

getRequiredCurrencies(app: PosApplication): string[] {
  // const app = this.applications()[index];
  if (!app) return [];

  const categories = app.requests.map(r => r.category.name);
  const hasUSD  = categories.some(c => c.includes("USD"));
  const hasZWG  = categories.some(c => c.includes("ZWG"));
  const isMulti = categories.some(c => c.includes("MULTI")) || (hasUSD && hasZWG);

  if (isMulti) return ["USD", "ZWG"];  // both required
  if (hasUSD)  return ["USD"];
  if (hasZWG)  return ["ZWG"];
  return [];
}


//   canSubmit(appId: string): boolean {
//   const selected = this.getSelection(appId).selectedCodes;
//   const required = this.getRequiredCurrencies(appId);

//   // Every required currency must have at least one selected code covering it
//   return required.every(currency =>
//     selected.some(c => c.currency === currency || c.currency === "BOTH")
//   );
// }

canSubmit(app: PosApplication): boolean {
  const selected = this.getSelection(app.id).selectedCodes;
  const required = this.getRequiredCurrencies(app);

  return required.every(currency =>
    selected.some(c => c.currency === currency || c.currency === "BOTH")
  );
}

  getRemarks(appId: string): string {
    return this.selectionMap().get(appId)?.remarks ?? "";
  }

  // ── Authorise / Decline ────────────────────────────────────────
 authorise(pagedIndex: number, status: "APPROVED" | "REJECTED"): void {

      const app = this.pagedApplications[pagedIndex];
      if (!app) return;
    //  const app = this.applications()[index];
    //  const remarks = this.getRemarks(index);

    // const masterIndex = this.applications().findIndex(a => a.id === app.id);
    // const remarks = this.getRemarks(masterIndex);
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
       chargeCodes:   selection.selectedCodes
     };
 
     this.isSubmitting.set(true);

     
 
     this.tellerService.authorise(payload).subscribe({
       next: () => {
         this.isSubmitting.set(false);
         this.toast.show(`Application ${status === "APPROVED" ? "approved" : "rejected"} successfully`);

         this.applications.update(list => list.filter(a => a.id !== app.id));

        //  this.applications.update(list => list.filter((_, i) => i !== index));

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

   canDecline(appId: string): boolean {
  return !!this.getRemarks(appId).trim();
}

  onDropdownSelect(appId: string, event: Event): void {
  const id = (event.target as HTMLSelectElement).value;
  if (!id) return;

  const code = this.chargeCodes().find(c => c.id === id);
  if (code && !this.isCodeSelected(appId, code)) {
    const sel = this.getSelection(appId);
    const updated = new Map(this.selectionMap());
    updated.set(appId, {
      ...sel,
      selectedCodes: [...sel.selectedCodes, code]
    });
    this.selectionMap.set(updated); // ✅ new Map reference triggers reactivity
  }

  (event.target as HTMLSelectElement).value = "";
}

updateRemarks(appId: string, value: string): void {
  const sel = this.getSelection(appId);
  const updated = new Map(this.selectionMap());
  updated.set(appId, { ...sel, remarks: value });
  this.selectionMap.set(updated);
}

// Transforms "AWAITING_TELLER_APPROVAL" into "Awaiting Teller Approval"
transformStatus(status: string): string {
  if (!status) return 'N/A';
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Returns a specific CSS class based on the status
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

  getCurrencyColor(currency: string): string {
    const map: Record<string, string> = {
      USD:  "chip-usd",
      ZWG:  "chip-zwg",
      BOTH: "chip-multi"
    };
    return map[currency] ?? "chip-usd";
  }

  onLogout() {
   this.auth.logout();
  }

  isFinalized(status: string): boolean {
  return ['APPROVED', 'REJECTED','AWAITING_BM_APPROVAL', 
    'AWAITING_MSA_ACTIONING'].includes(status);
}
}