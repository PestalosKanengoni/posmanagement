import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PosService } from "../../../../core/services/pos.service";
import { BadgeComponent } from "../../../../shared/components/badge/badge.component";

@Component({
  selector: "app-machines",
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: "./machines.component.html",
  styleUrl: "./machines.component.css"
})
export class MachinesComponent {
  pos = inject(PosService);
  searchTerm = signal("");

  machines = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.pos.machines()
      .filter(m => m.status !== "pending")
      .filter(m =>
        !q ||
        m.serial.toLowerCase().includes(q) ||
        m.merchant.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        (m.mid && m.mid.toLowerCase().includes(q))
      );
  });
}
