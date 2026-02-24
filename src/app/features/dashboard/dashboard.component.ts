import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService, Toast } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  toasts: Toast[] = [];

  private subs = new Subscription();

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.currentUser$.subscribe((user) => (this.currentUser = user))
    );

    this.subs.add(
      this.toastService.toasts$.subscribe((toast) => {
        this.toasts.push(toast);
        setTimeout(() => {
          this.toasts = this.toasts.filter((t) => t.id !== toast.id);
        }, 3500);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
