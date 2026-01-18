import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';


export class CustomValidators {
  static strongPassword(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasMinLength = value.length >= 8;
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasMinLength;

      if (!passwordValid) {
        return {
          strongPassword: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasMinLength
          }
        };
      }
      return null;
    };
  }
  static passwordMatch(passwordField: string = 'password', confirmField: string = 'confirmPassword'): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const password = formGroup.get(passwordField);
      const confirmPassword = formGroup.get(confirmField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.value === '') {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        const errors = confirmPassword.errors;

        if (errors) {
          delete errors['passwordMismatch'];
          confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
      return null;
    };
  }
  static noWhitespace(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }
      const isWhitespace = (value || '').trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }
  static url(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }
      try {
        const url = new URL(value);
        const isValid = url.protocol === 'http:' || url.protocol === 'https:';
        return isValid ? null : { url: true };
      } catch {
        return { url: true };
      }
    };
  }
  static minArrayLength(min: number): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return null;
      }
      return control.value.length >= min ? null : { minArrayLength: { min, actual: control.value.length } };
    };
  }
  static atLeastOneChecked(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return null;
      }
      const hasChecked = control.value.some((checked: boolean) => checked === true);
      return hasChecked ? null : { atLeastOneChecked: true };
    };
  }
  static uniqueValues(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return null;
      }
      const values = control.value.filter((v: any) => v && v.trim && v.trim() !== '');
      const uniqueValues = new Set(values);
      return values.length === uniqueValues.size ? null : { duplicateValues: true };
    };
  }
  static futureDate(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }
      const inputDate = new Date(value);
      const now = new Date();
      return inputDate > now ? null : { pastDate: true };
    };
  }
}


export class ValidationMessages {
  static getErrorMessage(fieldName: string, errors: ValidationErrors): string {

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return `${fieldName} jest wymagane`;
    }

    if (errors['email']) {
      return 'Nieprawidłowy format email';
    }

    if (errors['minlength']) {
      const min = errors['minlength'].requiredLength;
      return `${fieldName} musi mieć minimum ${min} znaków`;
    }

    if (errors['maxlength']) {
      const max = errors['maxlength'].requiredLength;
      const actual = errors['maxlength'].actualLength;
      return `${fieldName} może mieć maksymalnie ${max} znaków (aktualnie: ${actual})`;
    }

    if (errors['min']) {
      const min = errors['min'].min;
      return `Minimalna wartość to ${min}`;
    }

    if (errors['max']) {
      const max = errors['max'].max;
      return `Maksymalna wartość to ${max}`;
    }

    if (errors['pattern']) {
      return `${fieldName} ma nieprawidłowy format`;
    }

    if (errors['passwordMismatch']) {
      return 'Hasła nie są identyczne';
    }

    if (errors['strongPassword']) {
      const requirements = errors['strongPassword'];
      const missing = [];
      if (!requirements.hasUpperCase) missing.push('wielką literę');
      if (!requirements.hasLowerCase) missing.push('małą literę');
      if (!requirements.hasNumeric) missing.push('cyfrę');
      if (!requirements.hasMinLength) missing.push('minimum 8 znaków');
      return `Hasło musi zawierać: ${missing.join(', ')}`;
    }

    if (errors['whitespace']) {
      return `${fieldName} nie może być puste`;
    }

    if (errors['url']) {
      return 'Nieprawidłowy adres URL (wymagane http:// lub https://)';
    }

    if (errors['minArrayLength']) {
      const min = errors['minArrayLength'].min;
      return `Wymagane minimum ${min} opcji`;
    }

    if (errors['atLeastOneChecked']) {
      return 'Wybierz przynajmniej jedną opcję';
    }

    if (errors['duplicateValues']) {
      return 'Wszystkie opcje muszą być unikalne';
    }

    if (errors['pastDate']) {
      return 'Data musi być w przyszłości';
    }
    return 'Nieprawidłowa wartość';
  }
}


export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();


    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    }
  });
}


export function focusFirstInvalidField(formGroup: FormGroup, formElement: HTMLElement): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);


    if (control?.invalid) {
      const invalidControl = formElement.querySelector(`[formcontrolname="${key}"]`) as HTMLElement;


      if (invalidControl) {
        invalidControl.focus();
        invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
  });
}
