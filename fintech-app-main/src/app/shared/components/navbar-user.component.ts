import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="logo-icon">💎</span>
        <a routerLink="/dashboard">FinTech App</a>
      </div>

      <div class="navbar-user">
        <span class="user-name">{{ authService.currentUser()?.name }}</span>
        <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--gradient-primary);
      color: var(--color-text-light);
      padding: var(--spacing-md) var(--spacing-xl);
      box-shadow: var(--shadow-sm);
      z-index: var(--z-index-sticky);
      height: var(--navbar-height);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: var(--font-size-3xl);
    }

    .navbar-brand a {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-light);
      text-decoration: none;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .user-name {
      font-weight: var(--font-weight-medium);
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: var(--color-text-light);
      border: 1px solid var(--color-text-light);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: var(--transition-base);
      font-weight: var(--font-weight-medium);
    }

    .btn-logout:hover {
      background: var(--color-background-light);
      color: var(--color-purple);
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem var(--spacing-md);
        height: 60px;
      }

      .navbar-brand a {
        font-size: var(--font-size-xl);
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarUserComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
