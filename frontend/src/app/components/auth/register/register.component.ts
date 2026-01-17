import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { PasswordInputComponent } from '../../shared/password-input/password-input.component';
import { FormFieldErrorComponent } from '../../shared/form-field-error/form-field-error.component';
import { CustomValidators } from '../../../utils/form-validators';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PasswordInputComponent, FormFieldErrorComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})


export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading = false;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(40),
        CustomValidators.strongPassword()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: CustomValidators.passwordMatch() });
  }

  onSubmit(): void {

    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const user = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      this.userService.createUser(user).subscribe({
        next: () => {
          this.successMessage = 'Konto utworzone! Sprawdź email aby potwierdzić konto.';
          this.authService.sendConfirmationEmail(user.email).subscribe({
            next: () => {
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            },
            error: (error) => {
            }
          });
        },
        error: (error) => {
          this.loading = false;

          if (error.status === 429) {
            this.errorMessage = error.error?.detail || 'Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę.';
          } else if (error.error?.detail) {
            this.errorMessage = error.error.detail;
          } else if (error.status === 400) {
            this.errorMessage = 'Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie.';
          } else if (error.status === 409) {
            this.errorMessage = 'Użytkownik z tym adresem email już istnieje.';
          } else {
            this.errorMessage = 'Błąd podczas rejestracji. Spróbuj ponownie później.';
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
