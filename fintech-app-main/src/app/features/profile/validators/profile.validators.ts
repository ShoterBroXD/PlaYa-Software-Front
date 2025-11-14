import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores específicos para el módulo de perfil de usuario
 */
export class ProfileValidators {

  // Validador para DNI peruano
  static peruvianDNI(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const dniPattern = /^\d{8}$/;
      return dniPattern.test(control.value) ? null : { invalidDNI: true };
    };
  }

  // Validador para teléfono peruano (9 dígitos)
  static peruvianPhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const phonePattern = /^\d{9}$/;
      return phonePattern.test(control.value) ? null : { invalidPhone: true };
    };
  }

  // Validador para nombres (solo letras y espacios)
  static nameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return namePattern.test(control.value) ? null : { invalidNameFormat: true };
    };
  }

  // Validador para dirección (longitud mínima)
  static addressMinLength(minLength: number = 10): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return control.value.trim().length >= minLength ? null : { addressTooShort: { requiredMin: minLength } };
    };
  }

  // Validador para ocupación (caracteres permitidos)
  static occupation(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const occupationPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return occupationPattern.test(control.value) ? null : { invalidOccupation: true };
    };
  }
}
