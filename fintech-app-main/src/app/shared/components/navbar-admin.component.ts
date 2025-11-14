import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="logo-icon">👑</span>
        <a routerLink="/dashboard">FinTech Admin</a>
      </div>

      <div class="navbar-user">
        <span class="admin-badge">ADMIN</span>
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1001;
      height: 64px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .navbar-brand a {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .admin-badge {
      background: rgba(255, 255, 255, 0.3);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .user-name {
      font-weight: 500;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }

    .btn-logout:hover {
      background: white;
      color: #f5576c;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem 1rem;
        height: 60px;
      }

      .navbar-brand a {
        font-size: 1.25rem;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarAdminComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
