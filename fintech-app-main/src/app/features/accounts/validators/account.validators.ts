import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores específicos para el módulo de cuentas bancarias
 */
export class AccountValidators {

  // Validador para número de cuenta (formato específico)
  static accountNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      // Ejemplo: 10 dígitos numéricos
      const accountPattern = /^\d{10}$/;
      return accountPattern.test(control.value) ? null : { invalidAccountNumber: true };
    };
  }

  // Validador para balance inicial mínimo
  static minInitialBalance(minAmount: number = 0): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const amount = parseFloat(control.value);
      return amount >= minAmount ? null : { minInitialBalance: { requiredMin: minAmount, actual: amount } };
    };
  }

  // Validador para balance máximo permitido
  static maxBalance(maxAmount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const amount = parseFloat(control.value);
      return amount <= maxAmount ? null : { maxBalance: { allowedMax: maxAmount, actual: amount } };
    };
  }

  // Validador para formato de moneda (2 decimales)
  static currencyFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const currencyPattern = /^\d+(\.\d{1,2})?$/;
      return currencyPattern.test(control.value.toString()) ? null : { invalidCurrencyFormat: true };
    };
  }

  // Validador para número de cuenta con rango de dígitos configurable
  static accountNumberRange(minDigits: number = 10, maxDigits: number = 20): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const accountPattern = new RegExp(`^[0-9]{${minDigits},${maxDigits}}$`);
      return accountPattern.test(control.value) ? null : {
        invalidAccountNumberRange: {
          minDigits,
          maxDigits,
          actual: control.value
        }
      };
    };
  }
}
