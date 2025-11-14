import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { AccountResponse } from '@core/models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="account-list-container">
      <div class="header">
        <h2>Mis Cuentas</h2>
        <a routerLink="/accounts/create" class="btn btn-primary">+ Nueva Cuenta</a>
      </div>

      <!-- Buscador -->
      <div class="search-panel">
        <form [formGroup]="searchForm" class="search-form">
          <input
            type="text"
            formControlName="accountNumber"
            class="search-input"
            placeholder="Buscar por número de cuenta...">
          <button type="button" class="btn btn-search" (click)="searchAccount()">Buscar</button>
          <button type="button" class="btn btn-clear" (click)="clearSearch()">Limpiar</button>
        </form>
      </div>

      @if (loading()) {
        <p>Cargando cuentas...</p>
      } @else if (accounts().length === 0) {
        <div class="empty-state">
          <p>No tienes cuentas registradas</p>
          <a routerLink="/accounts/create" class="btn btn-secondary">Crear primera cuenta</a>
        </div>
      } @else {
        <div class="accounts-grid">
          @for (account of accounts(); track account.id) {
            <div class="account-card">
              <div class="account-info">
                <h3>{{ account.accountNumber }}</h3>
                <p class="customer-name">{{ account.customerName || 'Cliente' }}</p>
                <p class="balance">{{ '$' + account.balance.toFixed(2) }}</p>
                <span class="status" [class.active]="account.active" [class.inactive]="!account.active">
                  {{ account.active ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              <div class="account-actions">
                <a [routerLink]="['/accounts', account.id]" class="btn-link">Ver detalles</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .account-list-container {
      padding: var(--spacing-xl);
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }
    .account-card {
      background: var(--color-background-light);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }
    .account-info h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-primary);
    }
    .customer-name {
      color: var(--color-text-secondary);
      margin: var(--spacing-sm) 0;
    }
    .balance {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-secondary);
      margin: var(--spacing-md) 0;
    }
    .status {
      display: inline-block;
      padding: var(--spacing-xs) 0.75rem;
      border-radius: var(--border-radius-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .status.active {
      background: var(--color-success-light);
      color: var(--color-success-dark);
    }
    .status.inactive {
      background: var(--color-danger-light);
      color: var(--color-danger-dark);
    }
    .account-actions {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
    }
    .btn-link {
      color: #003D7A;
      text-decoration: none;
      font-weight: 500;
    }
    .btn-link:hover {
      text-decoration: underline;
    }
    .btn-primary {
      background: var(--color-secondary);
      color: var(--color-text-light);
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .btn-secondary {
      background: var(--color-gray);
      color: var(--color-text-light);
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
    }
    .search-panel {
      background: var(--color-background-light);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }
    .search-form {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    }
    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--color-border-light);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-base);
    }
    .btn-search {
      background: var(--color-blue);
      color: var(--color-text-light);
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-clear {
      background: var(--color-gray);
      color: var(--color-text-light);
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
  `]
})
export class AccountListComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);

  searchForm: FormGroup = this.fb.group({
    accountNumber: ['']
  });

  ngOnInit() {
    this.loadAllAccounts();
  }

  loadAllAccounts() {
    this.loading.set(true);
    this.accountService.get().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  searchAccount() {
    const accountNumber = this.searchForm.value.accountNumber?.trim();
    if (!accountNumber) {
      this.loadAllAccounts();
      return;
    }

    this.loading.set(true);
    this.accountService.getByNumber(accountNumber).subscribe({
      next: (account) => {
        this.accounts.set([account]);
        this.loading.set(false);
      },
      error: () => {
        this.accounts.set([]);
        this.loading.set(false);
      }
    });
  }

  clearSearch() {
    this.searchForm.reset();
    this.loadAllAccounts();
  }
}
