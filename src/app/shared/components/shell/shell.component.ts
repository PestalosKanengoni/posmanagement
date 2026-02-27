import { Component, inject, Input } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { ToastComponent } from "../toast/toast.component";

export interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="shell">

      <!-- TOPBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="logo">POS<span>/</span>CONSOLE</div>
          <div class="role-badge" [class]="auth.currentUser()?.role">
            <span class="dot"></span>
            {{ auth.currentUser()?.role | titlecase }}
          </div>
        </div>
        <div class="topbar-right">
          <div class="user-info" *ngIf="auth.currentUser() as user">
            <div class="user-avatar">{{ user.initials }}</div>
            <span class="user-name">{{ user.name }}</span>
          </div>
          <button class="btn-logout" (click)="auth.logout()">Sign Out</button>
        </div>
      </header>

      <!-- NAV TABS -->
      <nav class="nav-bar">
        <a
          *ngFor="let link of navLinks"
          class="nav-tab"
          [routerLink]="link.path"
          routerLinkActive="active"
          [class]="roleClass"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- PAGE CONTENT -->
      <main class="main-content">
        <router-outlet />
      </main>

    </div>

    <!-- TOAST — global, rendered outside main layout -->
    <app-toast />
  `,
  styleUrl: "./shell.component.css"
})
export class ShellComponent {
  @Input() navLinks: NavLink[] = [];
  @Input() roleClass = "";

  auth = inject(AuthService);
}
