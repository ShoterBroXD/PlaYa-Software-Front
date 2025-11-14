import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransactionService } from '@core/services/transaction.service';
import { TransactionResponse } from '@core/models/transaction.model';
import { Page, PageRequest } from '@core/models/page.model';
import { TransactionValidators } from '../validators/transaction.validators';

@Component({
  selector: 'app-transactions-list-paginated',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="transactions-container">
      <div class="transactions-header">
        <h2>Mis Transacciones (Paginado)</h2>
        <div class="header-actions">
          <a routerLink="/transactions/deposit" class="btn btn-success">Depositar</a>
          <a routerLink="/transactions/withdraw" class="btn btn-warning">Retirar</a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-panel">
        <form [formGroup]="filterForm" class="filters-form">
          <div class="form-group">
            <label for="startDate">Fecha Inicio</label>
            <input
              id="startDate"
              type="datetime-local"
              formControlName="startDate"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="endDate">Fecha Fin</label>
            <input
              id="endDate"
              type="datetime-local"
              formControlName="endDate"
              class="form-control">
          </div>

          <div class="filter-actions">
            <button type="button" class="btn btn-primary" (click)="applyFilters()">Filtrar</button>
            <button type="button" class="btn btn-secondary" (click)="clearFilters()">Limpiar</button>
          </div>
        </form>
        @if (filterForm.errors?.['dateRangeInvalid']) {
          <div class="filter-error">
            <span class="error-icon">⚠️</span>
            <span>La fecha de inicio no puede ser mayor que la fecha de fin</span>
          </div>
        }
      </div>

      @if (loading()) {
        <p>Cargando transacciones...</p>
      } @else if (page()) {
        <div class="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Balance Después</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of page()!.content; track tx.id) {
                <tr>
                  <td>{{ tx.timestamp | date:'short' }}</td>
                  <td>{{ tx.accountNumber }}</td>
                  <td>
                    <span class="badge" [class.deposit]="tx.type === 'DEPOSIT'" [class.withdraw]="tx.type === 'WITHDRAW'">
                      {{ tx.type === 'DEPOSIT' ? 'Depósito' : 'Retiro' }}
                    </span>
                  </td>
                  <td class="amount" [class.positive]="tx.type === 'DEPOSIT'" [class.negative]="tx.type === 'WITHDRAW'">
                    {{ (tx.type === 'DEPOSIT' ? '+' : '-') + '$' + tx.amount.toFixed(2) }}
                  </td>
                  <td>{{ '$' + tx.balanceAfter.toFixed(2) }}</td>
                  <td>{{ tx.description || '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
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
            ({{ page()!.totalElements }} transacciones)
          </span>

          <button
            class="btn-page"
            [disabled]="page()!.last"
            (click)="goToPage(page()!.number + 1)">
            Siguiente
          </button>
        </div>
      } @else {
        <p>No hay transacciones disponibles</p>
      }
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: var(--spacing-xl);
      max-width: 1400px;
      margin: 0 auto;
    }
    .transactions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }
    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }
    .filters-panel {
      background: var(--color-background-light);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }
    .filters-form {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--spacing-md);
      align-items: end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group label {
      margin-bottom: var(--spacing-sm);
      font-weight: var(--font-weight-medium);
    }
    .form-control {
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border-light);
      border-radius: var(--border-radius-sm);
    }
    .filter-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
    .transactions-table {
      background: var(--color-background-light);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-xl);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: var(--color-background);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .badge.deposit {
      background: #d4edda;
      color: #155724;
    }
    .badge.withdraw {
      background: #fff3cd;
      color: #856404;
    }
    .amount {
      font-weight: 600;
      font-size: 1.1rem;
    }
    .amount.positive {
      color: #28a745;
    }
    .amount.negative {
      color: #dc3545;
    }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .btn-primary {
      background: #003D7A;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-success {
      background: #28a745;
      color: white;
    }
    .btn-warning {
      background: #ffc107;
      color: #000;
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
    .filter-error {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      margin-top: var(--spacing-md);
      background: var(--color-danger-light);
      color: var(--color-danger);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-danger);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .error-icon {
      font-size: 1.2rem;
    }
  `]
})
export class TransactionsListPaginatedComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private fb = inject(FormBuilder);

  page = signal<Page<TransactionResponse> | null>(null);
  loading = signal(true);
  currentPageRequest: PageRequest = {
    page: 0,
    size: 20,
    sortBy: 'timestamp',
    sortDir: 'DESC'
  };

  filterForm: FormGroup = this.fb.group({
    startDate: [''],
    endDate: ['']
  }, { validators: TransactionValidators.dateRange('startDate', 'endDate') });

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading.set(true);
    const startDate = this.filterForm.value.startDate;
    const endDate = this.filterForm.value.endDate;

    // Si hay filtros de fecha, usar el método de rango de fechas
    if (startDate && endDate) {
      this.transactionService.getByDateRangePaginated(startDate, endDate, this.currentPageRequest).subscribe({
        next: (data) => {
          this.page.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      // Sin filtros, cargar todas las transacciones
      this.transactionService.getPaginated(this.currentPageRequest).subscribe({
        next: (data) => {
          this.page.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  applyFilters() {
    this.currentPageRequest.page = 0; // Reset a primera página
    this.loadTransactions();
  }

  clearFilters() {
    this.filterForm.reset();
    this.currentPageRequest.page = 0;
    this.loadTransactions();
  }

  goToPage(pageNumber: number) {
    this.currentPageRequest.page = pageNumber;
    this.loadTransactions();
  }
}
