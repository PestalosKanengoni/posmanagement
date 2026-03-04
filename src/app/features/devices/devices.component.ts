import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ToastService } from "src/app/core/services/toast.service";
import { DevicesService } from "src/app/core/services/devices.service";


@Component({
  selector: "app-devices",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./devices.component.html",
  styleUrl: "./devices.component.css"
})
export class DevicesComponent {

  currentUser = this.auth.currentUser;

  activeTab = signal<'pos' | 'msisdn'>('pos');

  // ── POS form ──────────────────────────────────────────────────
  posForm = { serial: "", description: "", status:"" };
  posErrors: { serial?: string; description?: string; status?: string } = {};
  // posErrors: Record<string, string> = {};
  isPosSubmitting = signal(false);
  posSuccess = false;
  posServerError = "";

  posStatusOptions = [
    { value: "AWAITING_AUTHORIZATION",  label: "Awaiting Authorization" },
    { value: "AWAITING_IMPLEMENTATION", label: "Awaiting Implementation" },
    { value: "ACTIVE",                  label: "Active" },
    { value: "IDLE",                    label: "Idle" },
    { value: "INACTIVE",                label: "Inactive" },
    { value: "RECALLED",                label: "Recalled" },
    { value: "FAULTY",                  label: "Faulty" },
    { value: "BLOCKED",                 label: "Blocked" },
    { value: "ACTIVE_TRANSACTING",      label: "Active Transacting" }
  ];

  // ── MSISDN form ───────────────────────────────────────────────
  msisdnForm = { msisdn: "", serial: "", mno: "", status:"" };
  msisdnErrors: { msisdn?: string; serial?: string; mno?: string ; status?: string} = {};
  // msisdnErrors: Record<string, string> = {};
  isMsisdnSubmitting = signal(false);
  msisdnSuccess = false;
  msisdnServerError = "";

  msisdnStatusOptions = [
    { value: "IDLE",      label: "Idle" },
    { value: "ALLOCATED", label: "Allocated" },
    { value: "INACTIVE",  label: "Inactive" }
  ];

  // ── MNO options ───────────────────────────────────────────────
  mnoOptions = [
    { value: "NETONE",   label: "NetOne",   color: "#e53e3e" },
    { value: "ECONET",   label: "Econet",   color: "#38a169" },
    { value: "TELECEL",  label: "Telecel",  color: "#3182ce" }
  ];

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private devicesService: DevicesService
  ) {}

  setTab(tab: 'pos' | 'msisdn'): void {
    this.activeTab.set(tab);
  }

  // ── POS ───────────────────────────────────────────────────────
  private validatePos(): boolean {
    this.posErrors = {};
    if (!this.posForm.serial.trim())      this.posErrors.serial      = "Serial number is required.";
    if (!this.posForm.description.trim()) this.posErrors.description = "Description is required.";
    if (!this.posForm.status)             this.posErrors.status      = "Please select a status.";
    return !this.posErrors.serial && !this.posErrors.description && !this.posErrors.status;
  }

  submitPos(): void {
    if (!this.validatePos()) return;

    this.posServerError = "";
    this.posSuccess = false;
    this.isPosSubmitting.set(true);

    const payload = {
      serial:      this.posForm.serial.trim(),
      description: this.posForm.description.trim(),
      status:      this.posForm.status
    };

    this.devicesService.createPos(payload).subscribe({
      next: (res: any) => {
        this.isPosSubmitting.set(false);
        if (res.responseCode !== "000") {
          this.posServerError = res.responseDescription || "Registration failed.";
          this.toast.show(this.posServerError, "warn");
          return;
        }
        this.posSuccess = true;
        this.toast.show("POS terminal registered successfully");
        this.resetPos();
      },
      error: (err: any) => {
        this.isPosSubmitting.set(false);
        this.posServerError = err.error?.responseDescription || "Registration failed. Please try again.";
        this.toast.show(this.posServerError, "warn");
      }
    });
  }

  resetPos(): void {
    this.posForm = { serial: "", description: "" ,status: ""};
    this.posErrors = {};
    this.posServerError = "";
    this.posSuccess = false;
  }

  // ── MSISDN ────────────────────────────────────────────────────
  private validateMsisdn(): boolean {
    this.msisdnErrors = {};
    if (!this.msisdnForm.msisdn.trim()) this.msisdnErrors.msisdn = "MSISDN is required.";
    if (!this.msisdnForm.serial.trim()) this.msisdnErrors.serial = "Serial number is required.";
    if (!this.msisdnForm.mno)           this.msisdnErrors.mno    = "Please select a network operator.";
    if (!this.msisdnForm.status)        this.msisdnErrors.status  = "Please select a status.";
    return !this.msisdnErrors.msisdn && !this.msisdnErrors.serial && !this.msisdnErrors.mno && !this.msisdnErrors.status;;
  }

  submitMsisdn(): void {
    if (!this.validateMsisdn()) return;

    this.msisdnServerError = "";
    this.msisdnSuccess = false;
    this.isMsisdnSubmitting.set(true);

    const payload = {
      msisdn: this.msisdnForm.msisdn.trim(),
      serial: this.msisdnForm.serial.trim(),
      mno:    this.msisdnForm.mno,
      status: this.msisdnForm.status
    };

    this.devicesService.createMsisdn(payload).subscribe({
      next: (res: any) => {
        this.isMsisdnSubmitting.set(false);
        if (res.responseCode !== "000") {
          this.msisdnServerError = res.responseDescription || "Registration failed.";
          this.toast.show(this.msisdnServerError, "warn");
          return;
        }
        this.msisdnSuccess = true;
        this.toast.show("Mobile number registered successfully");
        this.resetMsisdn();
      },
      error: (err: any) => {
        this.isMsisdnSubmitting.set(false);
        this.msisdnServerError = err.error?.responseDescription || "Registration failed. Please try again.";
        this.toast.show(this.msisdnServerError, "warn");
      }
    });
  }

  resetMsisdn(): void {
    this.msisdnForm = { msisdn: "", serial: "", mno: "", status:"" };
    this.msisdnErrors = {};
    this.msisdnServerError = "";
    this.msisdnSuccess = false;
  }

  onLogout(): void {
    this.auth.logout();
  }
}