import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PasswordInputComponent } from '../../shared/password-input/password-input.component';
import { FormFieldErrorComponent } from '../../shared/form-field-error/form-field-error.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PasswordInputComponent, FormFieldErrorComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  infoMessage = '';
  loading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      if (params['message']) {
        this.infoMessage = params['message'];
      }
    });
  }

  onSubmit(): void {

    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const credentials = {
        username: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;

          if (error.status === 429) {
            this.errorMessage = error.error?.detail || 'Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.';
          } else {
            this.errorMessage = error.error?.detail || 'Nieprawidłowy email lub hasło';
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
