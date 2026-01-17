import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, AbstractControl } from '@angular/forms';
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="password-input-wrapper">
      <!-- Label -->
      <label *ngIf="label" [for]="id" class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-danger" aria-label="wymagane">*</span>
      </label>
      <!-- Input Group -->
      <div class="input-group">
        <input
          [type]="showPassword ? 'text' : 'password'"
          class="form-control"
          [class.is-invalid]="control?.invalid && control?.touched"
          [id]="id"
          [placeholder]="placeholder"
          [value]="value"
          [attr.maxlength]="maxLength"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [attr.aria-describedby]="ariaDescribedby"
          [attr.aria-invalid]="control?.invalid && control?.touched"
          [disabled]="disabled"
          autocomplete="current-password"
        >
        <!-- Toggle Button -->
        <button
          type="button"
          class="btn btn-outline-secondary password-toggle-btn"
          (click)="togglePasswordVisibility()"
          [attr.aria-label]="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
          [attr.title]="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
          tabindex="-1"
        >
          <!-- Eye Icon (Show) -->
          <svg
            *ngIf="!showPassword"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <!-- Eye Off Icon (Hide) -->
          <svg
            *ngIf="showPassword"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>
      <!-- Helper Text -->
      <small *ngIf="helperText && (!control?.invalid || !control?.touched)" class="form-text text-muted">
        {{ helperText }}
      </small>
      <!-- Password Strength Meter -->
      <div *ngIf="showStrengthMeter && value" class="password-strength-meter mt-2">
        <div class="strength-bar-container">
          <div
            class="strength-bar"
            [class.strength-weak]="passwordStrength === 'weak'"
            [class.strength-medium]="passwordStrength === 'medium'"
            [class.strength-strong]="passwordStrength === 'strong'"
            [style.width.%]="getStrengthPercentage()"
          ></div>
        </div>
        <small class="strength-label" [class]="'text-' + getStrengthColor()">
          {{ getStrengthLabel() }}
        </small>
      </div>
      <!-- Character Counter -->
      <small *ngIf="maxLength" class="form-text text-muted float-end">
        {{ value?.length || 0 }}/{{ maxLength }}
      </small>
    </div>
  `,
  styles: [`
    .password-input-wrapper {
      position: relative;
      margin-bottom: 1rem;
    }
    .input-group {
      position: relative;
    }
    .password-toggle-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      border-left: 1px solid var(--border-color);
      color: var(--body-color-secondary);
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem 0.75rem;
      margin-left: -1px;
    }
    .password-toggle-btn:hover {
      color: var(--primary);
      background: var(--gray-100);
      border-color: var(--primary);
      z-index: 2;
    }
    .password-toggle-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      z-index: 3;
    }
    .password-toggle-btn:active {
      transform: scale(0.95);
    }
    .input-group .form-control {
      border-right: 1px solid var(--border-color);
    }
    .input-group .form-control:hover {
      border-color: var(--primary);
      z-index: 1;
    }
    .input-group .form-control:hover + .password-toggle-btn {
      border-color: var(--primary);
      border-left-color: var(--primary);
    }
    .input-group .form-control:focus {
      border-color: var(--primary);
      box-shadow: none;
      z-index: 1;
    }
    .input-group .form-control:focus + .password-toggle-btn {
      border-color: var(--primary);
      border-left-color: var(--primary);
    }
    .input-group .form-control.is-invalid {
      border-color: var(--danger);
      z-index: 1;
    }
    .input-group .form-control.is-invalid + .password-toggle-btn {
      border-color: var(--danger);
      border-left-color: var(--danger);
      color: var(--danger);
    }
    .input-group .form-control.is-invalid:hover + .password-toggle-btn,
    .input-group .form-control.is-invalid:focus + .password-toggle-btn {
      border-left: 1px solid var(--danger);
      z-index: 2;
    }
    .password-strength-meter {
      margin-top: 0.5rem;
    }
    .strength-bar-container {
      height: 4px;
      background: var(--gray-200);
      border-radius: 2px;
      overflow: hidden;
    }
    .strength-bar {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }
    .strength-bar.strength-weak {
      background: var(--danger);
      width: 33%;
    }
    .strength-bar.strength-medium {
      background: var(--warning);
      width: 66%;
    }
    .strength-bar.strength-strong {
      background: var(--success);
      width: 100%;
    }
    .strength-label {
      display: inline-block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    @media (prefers-reduced-motion: reduce) {
      .password-toggle-btn,
      .strength-bar {
        transition: none;
      }
    }
  `]
})


export class PasswordInputComponent implements ControlValueAccessor {
  @Input() id: string = 'password';
  @Input() label: string = '';
  @Input() placeholder: string = 'Wpisz hasło';
  @Input() helperText: string = '';
  @Input() required: boolean = false;
  @Input() maxLength?: number;
  @Input() showStrengthMeter: boolean = false;
  @Input() control?: AbstractControl | null;
  @Input() ariaDescribedby?: string;
  value: string = '';
  showPassword: boolean = false;
  disabled: boolean = false;
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getStrengthPercentage(): number {

    switch (this.passwordStrength) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
      default: return 0;
    }
  }

  getStrengthLabel(): string {

    switch (this.passwordStrength) {
      case 'weak': return 'Słabe hasło';
      case 'medium': return 'Średnie hasło';
      case 'strong': return 'Silne hasło';
      default: return '';
    }
  }

  getStrengthColor(): string {

    switch (this.passwordStrength) {
      case 'weak': return 'danger';
      case 'medium': return 'warning';
      case 'strong': return 'success';
      default: return 'muted';
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;

    if (this.showStrengthMeter) {
      this.passwordStrength = this.calculatePasswordStrength(this.value);
    }
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';

    if (this.showStrengthMeter && value) {
      this.passwordStrength = this.calculatePasswordStrength(value);
    }
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
