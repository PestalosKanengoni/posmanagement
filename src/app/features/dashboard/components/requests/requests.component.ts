import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PosService } from "../../../../core/services/pos.service";
import { ToastService } from "../../../../core/services/toast.service";
import { BadgeComponent } from "../../../../shared/components/badge/badge.component";
import { StatCardComponent } from "../../../../shared/components/stat-card/stat-card.component";
import { ConfigModalComponent } from "../config-modal/config-modal.component";
import { PosMachine, PosStatus, ConfigurePayload } from "../../../../core/models/pos-machine.model";

@Component({
  selector: "app-requests",
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, StatCardComponent, ConfigModalComponent],
  templateUrl: "./requests.component.html",
  styleUrl: "./requests.component.css"
})
export class RequestsComponent {
  pos   = inject(PosService);
  toast = inject(ToastService);

  searchTerm    = signal("");
  activeFilter  = signal<PosStatus | "all">("all");
  selectedMachine = signal<PosMachine | null>(null);
  isModalOpen   = signal(false);

  stats = this.pos.stats;

  filteredMachines = computed(() => {
    const q      = this.searchTerm().toLowerCase();
    const filter = this.activeFilter();
    return this.pos.machines().filter(m => {
      const matchFilter = filter === "all" || m.status === filter;
      const matchSearch = !q || m.serial.toLowerCase().includes(q) || m.merchant.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  });

  setFilter(f: PosStatus | "all"): void { this.activeFilter.set(f); }

  openConfigure(machine: PosMachine): void {
    this.selectedMachine.set(machine);
    this.isModalOpen.set(true);
  }

  onConfigure(payload: ConfigurePayload): void {
    const machine = this.selectedMachine();
    if (!machine) return;
    this.pos.configure(machine.id, payload).subscribe(() => {
      this.toast.show("POS terminal configured successfully");
      this.isModalOpen.set(false);
    });
  }

  deploy(machine: PosMachine): void {
    this.pos.deploy(machine.id).subscribe(() => {
      this.toast.show(machine.serial + " deployed to " + machine.merchant);
    });
  }

  closeModal(): void { this.isModalOpen.set(false); }
}
