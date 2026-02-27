import { Component } from "@angular/core";
import { ShellComponent, NavLink } from "../../shared/components/shell/shell.component";

@Component({
  selector: "app-manager",
  standalone: true,
  imports: [ShellComponent],
  template: `<app-shell [navLinks]="links" roleClass="manager"/>`
})
export class ManagerComponent {
  links: NavLink[] = [
    { label: "Pending Approval", path: "/manager/approvals" },
    { label: "All Requests",     path: "/manager/all"       }
  ];
}
