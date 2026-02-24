import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { User } from '../models/pos-machine.model';

const AUTH_API = 'http://192.168.4.13:8099/auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({ providedIn: 'root' })

export class AuthService {
  private readonly STORAGE_KEY = 'pos_user';

  currentUser = signal<User | null>(this.loadUser());

  /** Holds the authenticated user until OTP is confirmed */
  pendingUser = signal<User | null>(null);

  private storageService = inject(StorageService)

  constructor(private http: HttpClient,private router: Router){}

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'login',
      {
        username,
        password,}).pipe(
          tap((response: any)=>{
            if(response){
              this.storageService.saveUser(response);
              console.log('User saved after login:', response);
            }
          })
        );
  }

  completeLogin(): void {
    const user = this.pendingUser();
    if (!user) return;
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.pendingUser.set(null);
  }

    cancelPendingLogin(): void {
    this.pendingUser.set(null);
  }

  async logout(): Promise<void> {
    // Clear OTP verification flag
    this.storageService.clearOtpVerified();
  // Clear all stored data
  this.storageService.clean();

  // Navigate to login page with replaceUrl to replace history
  await this.router.navigate(['/login'], {
    replaceUrl: true  // THIS IS CRUCIAL
  });

  this.clearNavigationHistory();
}

private clearNavigationHistory(): void {
  // Replace entire history with login page
  window.history.pushState(null, '', window.location.href);
}

  verifyOtp(otp: string): Observable<any> {
    const token = this.storageService.getToken();

    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  // Replace with your actual API URL
  return this.http.post(`${AUTH_API}verify-otp/${otp}`, {},{ headers });
}

 private loadUser(): User | null {
    const raw = sessionStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }


}
