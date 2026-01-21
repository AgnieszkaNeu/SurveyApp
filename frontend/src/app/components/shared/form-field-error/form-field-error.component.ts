import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidationMessages } from '../../../utils/form-validators';
@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="shouldShowError()"
      class="invalid-feedback d-block"
      [id]="errorId"
      role="alert"
      [attr.aria-live]="'polite'"
    >
      <span class="d-flex align-items-start gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="flex-shrink-0 mt-1"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ getErrorMessage() }}</span>
      </span>
    </div>
  `,
  styles: [`
    .invalid-feedback {
      font-size: 0.875rem;
      margin-top: 0.25rem;
      animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    svg {
      color: var(--danger);
    }
    @media (prefers-reduced-motion: reduce) {
      .invalid-feedback {
        animation: none;
      }
    }
  `]
})


export class FormFieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() fieldName: string = 'To pole';
  @Input() errorId: string = '';
  shouldShowError(): boolean {
    return !!(this.control && this.control.invalid && (this.control.dirty || this.control.touched));
  }

  getErrorMessage(): string {

    if (!this.control || !this.control.errors) {
      return '';
    }
    return ValidationMessages.getErrorMessage(this.fieldName, this.control.errors);
  }
}
