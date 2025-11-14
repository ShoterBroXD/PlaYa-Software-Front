import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores comunes y genéricos reutilizables en toda la aplicación
 */
export class CommonValidators {

  // Validador para edad mínima
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age - 1 } };
      }

      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  // Validador genérico para números de teléfono (configurable)
  static phone(digits: number = 9): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const phonePattern = new RegExp(`^\\d{${digits}}$`);
      return phonePattern.test(control.value) ? null : { invalidPhone: { requiredDigits: digits } };
    };
  }

  // Validador genérico para documentos de identidad numéricos
  static numericDocument(digits: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const docPattern = new RegExp(`^\\d{${digits}}$`);
      return docPattern.test(control.value) ? null : { invalidDocument: { requiredDigits: digits } };
    };
  }

  // Validador para rangos de fechas
  static dateRange(startDateField: string, endDateField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDate = formGroup.get(startDateField)?.value;
      const endDate = formGroup.get(endDateField)?.value;

      if (!startDate || !endDate) {
        return null;
      }

      return new Date(startDate) <= new Date(endDate) ? null : { invalidDateRange: true };
    };
  }

  // Validador para URLs
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const urlPattern = /^https?:\/\/.+/;
      return urlPattern.test(control.value) ? null : { invalidUrl: true };
    };
  }
}
