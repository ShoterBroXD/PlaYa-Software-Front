import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { TransactionService } from '@core/services/transaction.service';
import { AccountResponse } from '@core/models/account.model';
import { TransactionRequest, TransactionType } from '@core/models/transaction.model';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="deposit-container">
      <h2>Realizar Depósito</h2>
      <form [formGroup]="depositForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="accountNumber">Cuenta destino:</label>
          <select
            id="accountNumber"
            formControlName="accountNumber"
            class="form-control">
            <option value="">Seleccionar cuenta</option>
            @for (account of accounts(); track account.id) {
              <option [value]="account.accountNumber">
                {{ account.accountNumber + ' - ' + (account.customerName || 'Cliente') + ' ($' + account.balance.toFixed(2) + ')' }}
              </option>
            }
          </select>
          @if (depositForm.get('accountNumber')?.invalid && depositForm.get('accountNumber')?.touched) {
            <small class="error">Cuenta requerida</small>
          }
        </div>

        <div class="form-group">
          <label for="amount">Monto a depositar:</label>
          <input
            id="amount"
            type="number"
            formControlName="amount"
            class="form-control"
            placeholder="0.00">
          @if (depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched) {
            <small class="error">Monto debe ser mayor a 0</small>
          }
        </div>

        <div class="form-group">
          <label for="description">Descripción (opcional):</label>
          <textarea
            id="description"
            formControlName="description"
            class="form-control"
            rows="3"
            placeholder="Descripción de la transacción"></textarea>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        @if (successMessage()) {
          <div class="alert alert-success">{{ successMessage() }}</div>
        }

        <div class="actions">
          <button type="submit" [disabled]="depositForm.invalid || loading()" class="btn btn-success">
            {{ loading() ? 'Procesando...' : 'Depositar' }}
          </button>
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .deposit-container {
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
    textarea.form-control {
      resize: vertical;
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
    .alert-success {
      padding: 0.75rem;
      background: var(--color-success-light);
      color: var(--color-success-dark);
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
    .btn-success {
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
export class DepositComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);

  accounts = signal<AccountResponse[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  depositForm: FormGroup = this.fb.group({
    accountNumber: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: ['']
  });

  ngOnInit() {
    this.accountService.get().subscribe({
      next: (data) => {
        this.accounts.set(data);
      }
    });
  }

  onSubmit() {
    if (this.depositForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { accountNumber, amount, description } = this.depositForm.value;

      const request: TransactionRequest = {
        accountNumber,
        type: TransactionType.DEPOSIT,
        amount,
        description
      };

      this.transactionService.post(request).subscribe({
        next: () => {
          this.successMessage.set('Depósito realizado exitosamente');
          this.loading.set(false);
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage.set('Error al realizar el depósito');
          this.loading.set(false);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
