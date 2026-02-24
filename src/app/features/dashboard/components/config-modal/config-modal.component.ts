import { Component, Input, Output, EventEmitter, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { PosMachine, ConfigurePayload } from "../../../../core/models/pos-machine.model";

@Component({
  selector: "app-config-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./config-modal.component.html",
  styleUrl: "./config-modal.component.css"
})
export class ConfigModalComponent implements OnInit {
  @Input() machine!: PosMachine;
  @Output() configure = new EventEmitter<ConfigurePayload>();
  @Output() cancel    = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    mid:      ["", Validators.required],
    tid:      ["", Validators.required],
    account:  ["", Validators.required],
    network:  ["All Networks", Validators.required],
    currency: ["USD", Validators.required]
  });

  networks  = ["Visa / Mastercard", "ZimSwitch", "All Networks"];
  currencies = ["USD", "ZIG", "Multi-currency"];

  ngOnInit(): void {
    if (this.machine.mid) {
      this.form.patchValue({
        mid:      this.machine.mid,
        tid:      this.machine.tid ?? "",
        account:  this.machine.account ?? "",
        network:  this.machine.network ?? "All Networks",
        currency: this.machine.currency ?? "USD"
      });
    } else {
      this.form.patchValue({
        mid: "MID-" + Math.floor(100000 + Math.random() * 900000),
        tid: "TID-" + Math.floor(100000 + Math.random() * 900000),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.configure.emit(this.form.value as ConfigurePayload);
  }

  onCancel(): void { this.cancel.emit(); }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains("modal-overlay")) {
      this.onCancel();
    }
  }
}
