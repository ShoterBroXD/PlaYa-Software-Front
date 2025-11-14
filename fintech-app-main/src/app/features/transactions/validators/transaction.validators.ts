import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores específicos para el módulo de transacciones
 */
export class TransactionValidators {

  // Validador para monto de transacción (debe ser positivo)
  static positiveAmount(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const amount = parseFloat(control.value);
      return amount > 0 ? null : { notPositiveAmount: true };
    };
  }

  // Validador para monto mínimo de transacción
  static minTransactionAmount(minAmount: number = 1): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const amount = parseFloat(control.value);
      return amount >= minAmount ? null : { minTransactionAmount: { requiredMin: minAmount, actual: amount } };
    };
  }

  // Validador para monto máximo de transacción
  static maxTransactionAmount(maxAmount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const amount = parseFloat(control.value);
      return amount <= maxAmount ? null : { maxTransactionAmount: { allowedMax: maxAmount, actual: amount } };
    };
  }

  // Validador para fondos suficientes (para retiros)
  static sufficientFunds(availableBalance: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const amount = parseFloat(control.value);
      return amount <= availableBalance ? null : { insufficientFunds: { available: availableBalance, requested: amount } };
    };
  }

  // Validador para descripción de transacción (longitud máxima)
  static transactionDescription(maxLength: number = 255): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return control.value.length <= maxLength ? null : { descriptionTooLong: { maxLength, actual: control.value.length } };
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

  // Validador para rango de fechas (fecha inicio no debe ser mayor a fecha fin)
  static dateRange(startDateControlName: string, endDateControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDateControl = formGroup.get(startDateControlName);
      const endDateControl = formGroup.get(endDateControlName);

      if (!startDateControl || !endDateControl) {
        return null;
      }

      const startDate = startDateControl.value;
      const endDate = endDateControl.value;

      // Si alguno de los dos está vacío, no validar
      if (!startDate || !endDate) {
        return null;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Si la fecha de inicio es mayor a la fecha fin, retornar error
      return start > end ? { dateRangeInvalid: true } : null;
    };
  }
}
