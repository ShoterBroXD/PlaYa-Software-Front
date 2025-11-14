import { Routes } from '@angular/router';

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/account-list.component').then(m => m.AccountListComponent)
  },
  {
    path: 'paginated',
    loadComponent: () => import('./pages-paginated/accounts-list-paginated.component').then(m => m.AccountsListPaginatedComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/create-account.component').then(m => m.CreateAccountComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/account-detail.component').then(m => m.AccountDetailComponent)
  }
];
