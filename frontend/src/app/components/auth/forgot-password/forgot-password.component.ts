import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})


export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {

    if (this.forgotForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.authService.sendPasswordResetEmail(this.forgotForm.value.email).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Link do resetowania hasła został wysłany na Twój email.';
          this.forgotForm.reset();
        },
        error: (error) => {
          this.loading = false;

          if (error.status === 429) {
            this.errorMessage = error.error?.detail || 'Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę.';
          } else {
            this.errorMessage = error.error?.message || 'Wystąpił błąd. Spróbuj ponownie.';
          }
        }
      });
    }
  }

  get email() {
    return this.forgotForm.get('email');
  }
}
