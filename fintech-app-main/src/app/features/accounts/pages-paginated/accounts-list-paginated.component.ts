import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { AccountResponse } from '@core/models/account.model';
import { Page, PageRequest } from '@core/models/page.model';

@Component({
  selector: 'app-accounts-list-paginated',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="accounts-container">
      <div class="accounts-header">
        <h2>Mis Cuentas (Paginado)</h2>
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
      } @else if (page()) {
        <div class="accounts-grid">
          @for (account of page()!.content; track account.id) {
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

        <div class="pagination">
          <button
            class="btn-page"
            [disabled]="page()!.first"
            (click)="goToPage(page()!.number - 1)">
            Anterior
          </button>

          <span class="page-info">
            Página {{ page()!.number + 1 }} de {{ page()!.totalPages }}
            ({{ page()!.totalElements }} cuentas)
          </span>

          <button
            class="btn-page"
            [disabled]="page()!.last"
            (click)="goToPage(page()!.number + 1)">
            Siguiente
          </button>
        </div>
      } @else {
        <p>No hay cuentas disponibles</p>
      }
    </div>
  `,
  styles: [`
    .accounts-container {
      padding: var(--spacing-xl);
      max-width: 1200px;
      margin: 0 auto;
    }
    .accounts-header {
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
      background: #00A859;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn-page {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .page-info {
      font-size: 0.875rem;
      color: #666;
    }
    .search-panel {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .search-form {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .btn-search {
      background: #007bff;
      color: white;
    }
    .btn-clear {
      background: #6c757d;
      color: white;
    }
  `]
})
export class AccountsListPaginatedComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  page = signal<Page<AccountResponse> | null>(null);
  loading = signal(true);
  isSearching = signal(false);
  currentPageRequest: PageRequest = {
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC'
  };

  searchForm: FormGroup = this.fb.group({
    accountNumber: ['']
  });

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading.set(true);
    this.accountService.getPaginated(this.currentPageRequest).subscribe({
      next: (data) => {
        this.page.set(data);
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
      this.isSearching.set(false);
      this.loadAccounts();
      return;
    }

    this.loading.set(true);
    this.isSearching.set(true);
    this.accountService.getByNumber(accountNumber).subscribe({
      next: (account) => {
        // Simular una página con un solo resultado
        this.page.set({
          content: [account],
          pageable: {} as any,
          totalPages: 1,
          totalElements: 1,
          last: true,
          first: true,
          size: 1,
          number: 0,
          sort: { sorted: false, unsorted: true, empty: true },
          numberOfElements: 1,
          empty: false
        });
        this.loading.set(false);
      },
      error: () => {
        this.page.set({
          content: [],
          pageable: {} as any,
          totalPages: 0,
          totalElements: 0,
          last: true,
          first: true,
          size: 0,
          number: 0,
          sort: { sorted: false, unsorted: true, empty: true },
          numberOfElements: 0,
          empty: true
        });
        this.loading.set(false);
      }
    });
  }

  clearSearch() {
    this.searchForm.reset();
    this.isSearching.set(false);
    this.currentPageRequest.page = 0;
    this.loadAccounts();
  }

  goToPage(pageNumber: number) {
    if (this.isSearching()) {
      return; // No permitir paginación durante búsqueda
    }
    this.currentPageRequest.page = pageNumber;
    this.loadAccounts();
  }
}
