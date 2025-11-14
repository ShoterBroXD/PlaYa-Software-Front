import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { TransactionService } from '@core/services/transaction.service';
import { AccountResponse } from '@core/models/account.model';
import { TransactionResponse } from '@core/models/transaction.model';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="account-detail-container">
      @if (loading()) {
        <p>Cargando detalles...</p>
      } @else if (account()) {
        <div class="account-header">
          <div>
            <h2>Cuenta {{ account()!.accountNumber }}</h2>
            <p class="customer-name">{{ account()!.customerName || 'Cliente' }}</p>
          </div>
          <div class="balance">
            <span class="label">Balance:</span>
            <span class="amount">{{ '$' + account()!.balance.toFixed(2) }}</span>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/transactions/deposit" class="btn btn-success">Depositar</a>
          <a routerLink="/transactions/withdraw" class="btn btn-warning">Retirar</a>
          <a routerLink="/accounts" class="btn btn-secondary">Volver</a>
        </div>

        <div class="transactions-section">
          <h3>Transacciones Recientes</h3>
          @if (transactions().length === 0) {
            <p class="empty">No hay transacciones registradas</p>
          } @else {
            <div class="transactions-list">
              @for (tx of transactions(); track tx.id) {
                <div class="transaction-item">
                  <div class="tx-info">
                    <span class="tx-type">{{ tx.type }}</span>
                    <span class="tx-date">{{ tx.timestamp | date:'short' }}</span>
                  </div>
                  <span class="tx-amount" [class.positive]="tx.type === 'DEPOSIT'" [class.negative]="tx.type === 'WITHDRAW'">
                    {{ (tx.type === 'DEPOSIT' ? '+' : '-') + '$' + tx.amount.toFixed(2) }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <p>Cuenta no encontrada</p>
      }
    </div>
  `,
  styles: [`
    .account-detail-container {
      padding: var(--spacing-xl);
      max-width: 800px;
      margin: 0 auto;
    }
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xl);
      background: var(--color-background-light);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }
    .account-type {
      color: var(--color-text-secondary);
      text-transform: uppercase;
      font-size: var(--font-size-sm);
    }
    .balance {
      text-align: right;
    }
    .balance .label {
      display: block;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
    .balance .amount {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-success);
    }
    .actions {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }
    .btn {
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-light);
    }
    .btn-success {
      background: var(--color-success);
    }
    .btn-warning {
      background: var(--color-warning);
      color: var(--color-text-primary);
    }
    .btn-secondary {
      background: var(--color-gray);
    }
    .transactions-section {
      background: var(--color-background-light);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }
    .transactions-list {
      margin-top: var(--spacing-md);
    }
    .transaction-item {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
    }
    .transaction-item:last-child {
      border-bottom: none;
    }
    .tx-info {
      display: flex;
      flex-direction: column;
    }
    .tx-type {
      font-weight: var(--font-weight-medium);
      text-transform: capitalize;
    }
    .tx-date {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
    .tx-amount {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }
    .tx-amount.positive {
      color: var(--color-success);
    }
    .tx-amount.negative {
      color: var(--color-danger);
    }
    .empty {
      text-align: center;
      color: #6c757d;
      padding: 2rem;
    }
  `]
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  account = signal<AccountResponse | null>(null);
  transactions = signal<TransactionResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    const accountId = this.route.snapshot.paramMap.get('id');
    

    if (accountId) {
      this.accountService.getById(accountId).subscribe({
        next: (data) => {
          this.account.set(data);
          this.loadTransactions(accountId);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  private loadTransactions(id: string) {
    this.transactionService.getByAccountId(id).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
