import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about.component').then(m => m.AboutComponent)
  }
];
