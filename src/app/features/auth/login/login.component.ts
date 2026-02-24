import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastService } from "../../../core/services/toast.service";
import { StorageService } from "src/app/core/services/storage.service";
import { AuthService } from "src/app/core/services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css"
})
export class LoginComponent {
   private fb     = inject(FormBuilder);
   private auth   = inject(AuthService);
   private router = inject(Router);
   private storageService = inject(StorageService)


  form: any = {
    username: null,
    password: null
  }


  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  isLoading = false;

  onSubmit(): void {

    if (!this.form.username || !this.form.password) {
      return;
    }

    this.isLoading    = true;
    this.isLoginFailed = false;
    this.errorMessage  = '';

    const { username, password } = this.form;


    this.auth.login(username, password).subscribe({
      next: (data) => {
        this.isLoading = false;

        // Backend returned a business-logic error
        if (data.responseCode) {
          this.errorMessage  = data.responseDescription || 'Invalid username or password';
          this.isLoginFailed = true;
          this.storageService.clean();
          return;
        }

        // Unexpected response shape
        if (!data.accessToken || !data.user) {
          this.errorMessage  = 'Invalid response from server';
          this.isLoginFailed = true;
          return;
        }

        this.storageService.saveUser(data);
        console.log('User saved, navigating to dashboard...');

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading     = false;
        this.isLoginFailed = true;
        this.errorMessage  = err.error?.responseDescription
                          || err.error?.message
                          || 'Invalid username or password';
        this.storageService.clean();
      }
    });
  }

    reloadPage(): void {
    window.location.reload();
  }
  
}
