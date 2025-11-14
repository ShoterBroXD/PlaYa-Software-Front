import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/transaction-reports.component').then(m => m.TransactionReportsComponent)
  }
];
