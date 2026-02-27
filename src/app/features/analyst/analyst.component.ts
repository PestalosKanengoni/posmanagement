import { Component } from '@angular/core';
import { NavLink } from 'src/app/shared/components/shell/shell.component';

@Component({
  selector: 'app-analyst',
  standalone: true,
  imports: [],
  templateUrl: `<app-shell [navLinks]="links" roleClass="analyst" />`
})
export class AnalystComponent {
  links: NavLink[] = [
    { label: "Pending Configuration", path: "/analyst/configure" },
    { label: "All Machines",          path: "/analyst/machines"  }
  ];
}
