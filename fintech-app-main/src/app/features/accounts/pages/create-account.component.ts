import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { AccountValidators } from '../validators/account.validators';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-account-container">
      <h2>Crear Nueva Cuenta</h2>
      <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="accountNumber">Número de Cuenta:</label>
          <input
            id="accountNumber"
            type="text"
            formControlName="accountNumber"
            class="form-control"
            placeholder="Ingrese número de cuenta (10-20 dígitos)"
            maxlength="20">
          @if (accountForm.get('accountNumber')?.invalid && accountForm.get('accountNumber')?.touched) {
            <small class="error">Número de cuenta requerido (10-20 dígitos)</small>
          }
        </div>

        <div class="form-group">
          <label for="initialBalance">Balance Inicial:</label>
          <input
            id="initialBalance"
            type="number"
            formControlName="initialBalance"
            class="form-control"
            placeholder="0.00">
          @if (accountForm.get('initialBalance')?.invalid && accountForm.get('initialBalance')?.touched) {
            <small class="error">Balance debe ser mayor o igual a 0</small>
          }
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        <div class="actions">
          <button type="submit" [disabled]="accountForm.invalid || loading()" class="btn btn-primary">
            {{ loading() ? 'Creando...' : 'Crear Cuenta' }}
          </button>
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-account-container {
      max-width: 600px;
      margin: var(--spacing-xl) auto;
      padding: var(--spacing-xl);
      background: var(--color-background-light);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }
    .form-group {
      margin-bottom: var(--spacing-lg);
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border-light);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-base);
    }
    .error {
      color: var(--color-danger);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      display: block;
    }
    .alert-error {
      padding: 0.75rem;
      background: var(--color-danger-light);
      color: var(--color-danger-dark);
      border-radius: var(--border-radius-sm);
      margin-bottom: var(--spacing-md);
    }
    .actions {
      display: flex;
      gap: var(--spacing-md);
    }
    .btn {
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      border: none;
      cursor: pointer;
      font-weight: var(--font-weight-medium);
    }
    .btn-primary {
      background: var(--color-success);
      color: var(--color-text-light);
      flex: 1;
    }
    .btn-secondary {
      background: var(--color-gray);
      color: var(--color-text-light);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class CreateAccountComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  accountForm: FormGroup = this.fb.group({
    accountNumber: ['', [Validators.required, AccountValidators.accountNumberRange(10, 20)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]]
  });

  onSubmit() {
    if (this.accountForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.accountService.post(this.accountForm.value).subscribe({
        next: () => {
          this.router.navigate(['/accounts']);
        },
        error: (error) => {
          this.errorMessage.set('Error al crear la cuenta');
          this.loading.set(false);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
