import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-dashboard-shell",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./dashboard-shell.component.html",
  styleUrl: "./dashboard-shell.component.css"
})
export class DashboardShellComponent {
  auth = inject(AuthService);
   user = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
  }
}
