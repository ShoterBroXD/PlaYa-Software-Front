import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/transaction-list.component').then(m => m.TransactionListComponent)
  },
  {
    path: 'paginated',
    loadComponent: () => import('./pages-paginated/transactions-list-paginated.component').then(m => m.TransactionsListPaginatedComponent)
  },
  {
    path: 'deposit',
    loadComponent: () => import('./pages/deposit.component').then(m => m.DepositComponent)
  },
  {
    path: 'withdraw',
    loadComponent: () => import('./pages/withdraw.component').then(m => m.WithdrawComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/transaction-detail.component').then(m => m.TransactionDetailComponent)
  }
];
