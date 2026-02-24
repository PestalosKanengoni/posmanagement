import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';


@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent {
  otpValue: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService,
     private router: Router,
      private storageService: StorageService) {}

  verify(): void {
    this.authService.verifyOtp(this.otpValue).subscribe({
      next: (response) => {

        if (response?.responseCode === '006') {
        this.errorMessage = response.responseDescription || "Invalid OTP or OTP has expired";
        return; // Stop execution here
      }

      this.storageService.setOtpVerified(true);

      this.router.navigate(['/dashboard'],  { replaceUrl: true });
      },
    });
  }

  clearError(): void {
  this.errorMessage = '';
}

}
