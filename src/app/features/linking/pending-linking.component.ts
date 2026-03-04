import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ToastService } from "src/app/core/services/toast.service";
import { AuthService } from "src/app/core/services/auth.service";
import { LinkingService, PosDevice,MsisdnDevice } from "src/app/core/services/linking.service";

export interface PosTerminalAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  customerId: string;
  isPrimary: boolean;
}

export interface PosTerminal {
  id: string;
  tid: string;
  status: string;
  category: { id: string; name: string; description: string };
  accounts: PosTerminalAccount[];
  pos: any | null;
}

export interface PendingMerchant {
  id: string;
  name: string;
  location: string;
  terminals: PosTerminal[];
}

// Per-terminal selection state — stores full objects, not just IDs
interface LinkFormState {
  selectedPos:    PosDevice | null;
  selectedMsisdn: MsisdnDevice | null;
}

@Component({
  selector: "app-pending-linking",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./pending-linking.component.html",
  styleUrl: "./pending-linking.component.css"
})
export class PendingLinkingComponent implements OnInit {

  currentUser = this.auth.currentUser;

  // ── Data ──────────────────────────────────────────────────────
  merchants         = signal<PendingMerchant[]>([]);
  posDevices        = signal<PosDevice[]>([]);
  msisdnList        = signal<MsisdnDevice[]>([]);

  // ── UI state ──────────────────────────────────────────────────
  isLoading         = signal(true);
  isLoadingDevices  = signal(false);
  isSubmitting      = signal(false);
  errorMessage      = signal("");
  linkingTerminalId = signal<string | null>(null);
  expandedMerchantId = signal<string | null>(null);

  // ── Form maps ─────────────────────────────────────────────────
  linkFormMap  = signal<Map<string, LinkFormState>>(new Map());
  formErrorMap = signal<Map<string, string>>(new Map());
  linkedIds    = signal<Set<string>>(new Set());

  // ── Pagination ────────────────────────────────────────────────
  pageSize    = 1;
  currentPage = signal(1);

  constructor(
    private linkingService: LinkingService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMerchants();
    this.loadDeviceLists();
  }

  // ── Loaders ───────────────────────────────────────────────────
  loadMerchants(): void {
    this.isLoading.set(true);
    this.errorMessage.set("");
    this.linkingTerminalId.set(null);
    this.expandedMerchantId.set(null);
    this.currentPage.set(1);

    this.linkingService.getPendingLinking().subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.responseCode === "000") {
          this.merchants.set(res.data);
        } else {
          this.errorMessage.set(res.responseDescription || "Failed to load merchants");
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.responseDescription || "Unable to load merchants");
      }
    });
  }

  loadDeviceLists(): void {
    this.isLoadingDevices.set(true);

    this.linkingService.getPosDevices().subscribe({
      next: (res: any) => {
        if (res.responseCode === "000") this.posDevices.set(res.data);
      },
      error: () => {}
    });

    this.linkingService.getMsisdnList().subscribe({
      next: (res: any) => {
        if (res.responseCode === "000") this.msisdnList.set(res.data);
        this.isLoadingDevices.set(false);
      },
      error: () => { this.isLoadingDevices.set(false); }
    });
  }

  // ── Pagination ────────────────────────────────────────────────
  get pagedMerchants(): PendingMerchant[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.merchants().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.merchants().length / this.pageSize);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
      this.linkingTerminalId.set(null);
      this.expandedMerchantId.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  // ── Accordion ─────────────────────────────────────────────────
  isExpanded(merchant: PendingMerchant): boolean {
    return merchant.terminals.length === 1 || this.expandedMerchantId() === merchant.id;
  }

  toggleMerchant(merchantId: string): void {
    const isOpen = this.expandedMerchantId() === merchantId;
    this.expandedMerchantId.set(isOpen ? null : merchantId);
    if (isOpen) this.linkingTerminalId.set(null);
  }

  // ── Link form ─────────────────────────────────────────────────
  openLinkForm(terminalId: string): void {
    this.linkingTerminalId.set(terminalId);
    if (!this.linkFormMap().has(terminalId)) {
      const updated = new Map(this.linkFormMap());
      updated.set(terminalId, { selectedPos: null, selectedMsisdn: null });
      this.linkFormMap.set(updated);
    }
    const err = new Map(this.formErrorMap());
    err.delete(terminalId);
    this.formErrorMap.set(err);
  }

  cancelLink(): void {
    this.linkingTerminalId.set(null);
  }

  getFormState(terminalId: string): LinkFormState {
    return this.linkFormMap().get(terminalId) ?? { selectedPos: null, selectedMsisdn: null };
  }

  // Called when user picks a POS from the dropdown (by id string)
  onPosSelect(terminalId: string, posId: string): void {
    const pos = this.posDevices().find(p => p.id === posId) ?? null;
    const updated = new Map(this.linkFormMap());
    updated.set(terminalId, { ...this.getFormState(terminalId), selectedPos: pos });
    this.linkFormMap.set(updated);
  }

  // Called when user picks an MSISDN from the dropdown (by id string)
  onMsisdnSelect(terminalId: string, msisdnId: string): void {
    const msisdn = this.msisdnList().find(m => m.id === msisdnId) ?? null;
    const updated = new Map(this.linkFormMap());
    updated.set(terminalId, { ...this.getFormState(terminalId), selectedMsisdn: msisdn });
    this.linkFormMap.set(updated);
  }

  getFormError(terminalId: string): string {
    return this.formErrorMap().get(terminalId) ?? "";
  }

  private setError(terminalId: string, msg: string): void {
    const updated = new Map(this.formErrorMap());
    msg ? updated.set(terminalId, msg) : updated.delete(terminalId);
    this.formErrorMap.set(updated);
  }

  // ── Validation ────────────────────────────────────────────────
  private validate(terminalId: string): boolean {
    const f = this.getFormState(terminalId);
    if (!f.selectedPos)    { this.setError(terminalId, "Please select a POS terminal.");    return false; }
    if (!f.selectedMsisdn) { this.setError(terminalId, "Please select a mobile number.");   return false; }
    this.setError(terminalId, "");
    return true;
  }

  // ── Submit ────────────────────────────────────────────────────
  submitLink(terminalId: string): void {
    if (!this.validate(terminalId)) return;

    const f = this.getFormState(terminalId);
    const pos    = f.selectedPos!;
    const msisdn = f.selectedMsisdn!;

    const payload = {
      id: terminalId,
      pos: {
        id:          pos.id,
        serial:      pos.serial,
        description: pos.description,
        status:      pos.status
      },
      msisdn: {
        id:     msisdn.id,
        msisdn: msisdn.msisdn,
        serial: msisdn.serial,
        mno:    msisdn.mno,
        status: msisdn.status
      }
    };

    this.isSubmitting.set(true);

    this.linkingService.linkToPos(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);

        if (res.responseCode !== "000") {
          const serverMsg = res.responseDescription;
          const isGeneric = !serverMsg || serverMsg.toLowerCase().includes("an error occurred");
          const msg = isGeneric ? "Linking failed. Please try again." : serverMsg;
          this.setError(terminalId, msg);
          this.toast.show(msg, "warn");
          return;
        }

        this.linkingTerminalId.set(null);
        this.toast.show("Terminal linked successfully");
        const linked = new Set(this.linkedIds());
        linked.add(terminalId);
        this.linkedIds.set(linked);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const msg = err.error?.responseDescription || "Linking failed. Please try again.";
        this.setError(terminalId, msg);
        this.toast.show(msg, "warn");
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  isLinked(terminalId: string): boolean {
    return this.linkedIds().has(terminalId);
  }

  getTotalTerminals(): number {
    return this.merchants().reduce((sum, m) => sum + m.terminals.length, 0);
  }

  getCurrencyColor(currency: string): string {
    const map: Record<string, string> = { USD: "chip-usd", ZWG: "chip-zwg", BOTH: "chip-multi" };
    return map[currency] ?? "chip-usd";
  }

  onLogout(): void {
    this.auth.logout();
  }
}