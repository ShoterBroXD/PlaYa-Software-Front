import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransactionService } from '@core/services/transaction.service';
import { TransactionResponse } from '@core/models/transaction.model';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="transaction-detail-container">
      @if (loading()) {
        <p>Cargando detalles...</p>
      } @else if (transaction()) {
        <div class="detail-card">
          <h2>Detalle de Transacción</h2>

          <div class="detail-row">
            <span class="label">ID de Transacción:</span>
            <span class="value">{{ transaction()!.id }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Tipo:</span>
            <span class="value tx-type" [class.deposit]="transaction()!.type === 'DEPOSIT'" [class.withdrawal]="transaction()!.type === 'WITHDRAW'">
              {{ transaction()!.type === 'DEPOSIT' ? 'Depósito' : 'Retiro' }}
            </span>
          </div>

          <div class="detail-row">
            <span class="label">Monto:</span>
            <span class="value amount" [class.positive]="transaction()!.type === 'DEPOSIT'" [class.negative]="transaction()!.type === 'WITHDRAW'">
              {{ (transaction()!.type === 'DEPOSIT' ? '+' : '-') + '$' + transaction()!.amount.toFixed(2) }}
            </span>
          </div>

          <div class="detail-row">
            <span class="label">Cuenta:</span>
            <span class="value">{{ transaction()!.accountNumber }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Fecha:</span>
            <span class="value">{{ transaction()!.timestamp | date:'full' }}</span>
          </div>

          @if (transaction()!.description) {
            <div class="detail-row">
              <span class="label">Descripción:</span>
              <span class="value">{{ transaction()!.description }}</span>
            </div>
          }

          <div class="actions">
            <a routerLink="/transactions" class="btn btn-secondary">Volver al historial</a>
            <a [routerLink]="['/accounts', transaction()!.accountNumber]" class="btn btn-primary">Ver cuenta</a>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <p>Transacción no encontrada</p>
          <a routerLink="/transactions" class="btn btn-secondary">Volver</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .transaction-detail-container {
      max-width: 700px;
      margin: var(--spacing-xl) auto;
      padding: var(--spacing-xl);
    }
    .detail-card {
      background: var(--color-background-light);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }
    h2 {
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--color-background);
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--color-background);
    }
    .detail-row:last-of-type {
      border-bottom: none;
      margin-bottom: var(--spacing-xl);
    }
    .label {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
    }
    .value {
      text-align: right;
    }
    .tx-type {
      text-transform: capitalize;
      padding: var(--spacing-xs) 0.75rem;
      border-radius: var(--border-radius-sm);
      font-weight: var(--font-weight-medium);
    }
    .tx-type.deposit {
      background: var(--color-success-light);
      color: var(--color-success-dark);
    }
    .tx-type.withdrawal {
      background: var(--color-danger-light);
      color: var(--color-danger-dark);
    }
    .amount {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
    }
    .amount.positive {
      color: var(--color-success);
    }
    .amount.negative {
      color: var(--color-danger);
    }
    .actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
    }
    .btn {
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-light);
    }
    .btn-primary {
      background: var(--color-blue);
    }
    .btn-secondary {
      background: var(--color-gray);
    }
    .not-found {
      text-align: center;
      padding: var(--spacing-3xl);
      background: var(--color-background-light);
      border-radius: var(--border-radius-md);
    }
  `]
})
export class TransactionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transactionService = inject(TransactionService);

  transaction = signal<TransactionResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    const transactionId = this.route.snapshot.paramMap.get('id');

    if (transactionId) {
      this.transactionService.getById(transactionId).subscribe({
        next: (data) => {
          this.transaction.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }
}
