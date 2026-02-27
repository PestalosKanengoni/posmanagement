import { Component, OnInit, signal } from "@angular/core";
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
  selectionMap   = new Map<number, SelectionState>();
  // availableCodes = AVAILABLE_CHARGE_CODES;
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

  // ── Data ───────────────────────────────────────────────────────
  loadApplications(): void {
    this.isLoading.set(true);
    this.errorMessage.set("");

    this.tellerService.getApplications().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.responseCode === "000") {
          this.applications.set(
            res.data.filter(a => a.approvalStatus === "AWAITING_TELLER_APPROVAL")
          );
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

  // ── Expand / collapse ──────────────────────────────────────────
  toggleExpand(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
    if (!this.selectionMap.has(index)) {
      this.selectionMap.set(index, { selectedCodes: [], remarks: "" });
    }
  }

  // ── Charge code selection ──────────────────────────────────────
  getSelection(index: number): SelectionState {
    if (!this.selectionMap.has(index)) {
      this.selectionMap.set(index, { selectedCodes: [], remarks: "" });
    }
    return this.selectionMap.get(index)!;
  }

  isCodeSelected(index: number, code: ChargeCode): boolean {
    return this.getSelection(index).selectedCodes.some(c => c.id === code.id);
  }

  toggleCode(index: number, code: ChargeCode): void {
    const sel = this.getSelection(index);
    const existing = sel.selectedCodes.findIndex(c => c.id === code.id);
    if (existing >= 0) {
      sel.selectedCodes.splice(existing, 1);
    } else {
      sel.selectedCodes.push(code);
    }
  }

  getFilteredCodes(index: number): ChargeCode[] {
  const app = this.applications()[index];
  const allCodes = this.chargeCodes(); // Get the current value of the signal
  
  if (!app) return allCodes;

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

  canSubmit(index: number): boolean {
    return this.getSelection(index).selectedCodes.length > 0;
  }

  // ── Authorise / Decline ────────────────────────────────────────
  authorise(index: number, status: "APPROVED" | "DECLINED"): void {
    const app = this.applications()[index];
    const sel = this.getSelection(index);

    if (status === "APPROVED" && sel.selectedCodes.length === 0) {
      this.toast.show("Please select at least one charge code", "warn");
      return;
    }

    const payload: AuthorisePayload = {
      // id: app.id,
      remarks:       sel.remarks,
      status,
      applicationId: app.id,
      // applicationId: app.requests[0]?.id,
      chargeCodes:   status === "APPROVED" ? sel.selectedCodes : []
    };

    this.isSubmitting.set(true);

    this.tellerService.authorise(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show(`Application ${status === "APPROVED" ? "approved" : "declined"} successfully`);
        this.applications.update(list => list.filter((_, i) => i !== index));
        this.expandedIndex.set(null);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.show(err.error?.responseDescription || "Action failed. Try again.", "warn");
      }
    });
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
}