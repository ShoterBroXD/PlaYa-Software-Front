import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores específicos para el módulo de autenticación
 */
export class AuthValidators {

  // Validador para contraseñas que coinciden
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordField)?.value;
      const confirmPassword = formGroup.get(confirmPasswordField)?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  // Validador para contraseña fuerte (requisitos de seguridad)
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(control.value);
      const hasLowerCase = /[a-z]/.test(control.value);
      const hasNumeric = /[0-9]/.test(control.value);
      const hasMinLength = control.value.length >= 8;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasMinLength;

      return passwordValid ? null : {
        weakPassword: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasMinLength
        }
      };
    };
  }

  // Validador para DNI peruano específico del registro
  static peruvianDNI(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const dniPattern = /^\d{8}$/;
      return dniPattern.test(control.value) ? null : { invalidPeruvianDNI: true };
    };
  }

  // Validador para nombres completos (mínimo 2 palabras)
  static fullName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const words = control.value.trim().split(/\s+/);
      return words.length >= 2 ? null : { invalidFullName: true };
    };
  }
}
