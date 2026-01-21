import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})


export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  token = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
      this.errorMessage = 'Brak tokena resetującego hasło';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {

    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const data = {
        token: this.token,
        new_password: this.resetForm.value.password
      };
      this.authService.resetPassword(data).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Hasło zostało zmienione! Za chwilę zostaniesz przekierowany do logowania.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.loading = false;

          if (error.status === 429) {
            this.errorMessage = error.error?.detail || 'Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę.';
          } else {
            this.errorMessage = error.error?.message || 'Błąd podczas zmiany hasła. Token może być nieprawidłowy lub wygasły.';
          }
        }
      });
    }
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }
}
