import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LandingLayoutComponent } from './shared/layouts/landing-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout.component';

export const routes: Routes = [
  // =============================================================================
  // RUTAS PÚBLICAS (Sin Layout)
  // =============================================================================
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },

  // =============================================================================
  // LANDING LAYOUT - Rutas de Autenticación (Login, Register)
  // =============================================================================
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
      }
    ]
  },

  // =============================================================================
  // AUTH LAYOUT - Rutas Protegidas (requiere autenticación)
  // Dashboard, Cuentas, Transacciones, Perfil
  // =============================================================================
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'accounts',
        loadChildren: () => import('./features/accounts/accounts.routes').then(m => m.ACCOUNTS_ROUTES)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'reports',
        // canActivate: [adminGuard], // TEMPORALMENTE DESACTIVADO PARA TESTING
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      }
    ]
  },

  // =============================================================================
  // FALLBACK - Ruta por defecto (404)
  // =============================================================================
  {
    path: '**',
    redirectTo: ''
  }
];
