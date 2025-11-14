import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <button class="toggle-btn" (click)="toggleSidebar()" title="Ocultar/Mostrar menú">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          @if (isCollapsed()) {
            <polyline points="9 18 15 12 9 6"/>
          } @else {
            <polyline points="15 18 9 12 15 6"/>
          }
        </svg>
      </button>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="section-title">Principal</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span class="nav-text">Dashboard</span>
          </a>

          <a routerLink="/accounts" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <span class="nav-text">Mis Cuentas</span>
          </a>

          <a routerLink="/transactions" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="nav-text">Transacciones</span>
          </a>
        </div>

        <div class="nav-section nav-section-divider">
          <div class="section-title">Vistas Paginadas</div>
          <a routerLink="/accounts/paginated" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
            <span class="nav-text">Cuentas Paginado</span>
          </a>

          <a routerLink="/transactions/paginated" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span class="nav-text">Transacciones Paginado</span>
          </a>
        </div>

        <!-- Sección de Administración - TEMPORALMENTE VISIBLE PARA TODOS (REMOVER @if PARA TESTING) -->
        <div class="nav-section nav-section-divider admin-section">
          <div class="section-title">Administración</div>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
            <span class="nav-text">Reportes</span>
          </a>
        </div>

        <div class="nav-section nav-section-bottom">
          <div class="section-title">Cuenta</div>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="nav-text">Mi Perfil</span>
          </a>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: var(--navbar-height);
      height: calc(100vh - var(--navbar-height));
      width: var(--sidebar-width);
      background: var(--color-background-light);
      box-shadow: var(--shadow-md);
      transition: var(--transition-base);
      z-index: var(--z-index-sidebar);
      display: flex;
      flex-direction: column;
    }

    .sidebar.collapsed {
      transform: translateX(calc(-1 * var(--sidebar-width)));
    }

    .toggle-btn {
      position: absolute;
      right: -40px;
      top: 10px;
      width: 36px;
      height: 36px;
      background: var(--color-purple);
      color: var(--color-text-light);
      border: none;
      border-radius: var(--border-radius-round);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-base);
      z-index: var(--z-index-fixed);
    }

    .toggle-btn:hover {
      background: var(--color-purple-dark);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
      transform: scale(1.05);
    }

    .toggle-btn svg {
      transition: var(--transition-base);
    }

    .sidebar-nav {
      padding: var(--spacing-md) 0;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
    }

    .nav-section-divider {
      padding-top: var(--spacing-md);
      margin-top: var(--spacing-md);
      border-top: 2px solid var(--color-border-light);
    }

    .nav-section-bottom {
      margin-top: auto;
      padding-top: var(--spacing-md);
      border-top: 2px solid var(--color-border-light);
    }

    .section-title {
      padding: 0.75rem var(--spacing-lg) var(--spacing-sm) var(--spacing-lg);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-muted);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: var(--transition-base);
      position: relative;
    }

    .nav-item:hover {
      background: var(--color-background);
      color: var(--color-purple);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
      color: var(--color-purple);
      border-left: 3px solid var(--color-purple);
    }

    .nav-item.active .nav-icon {
      color: var(--color-purple);
    }

    .nav-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .nav-text {
      font-size: 0.95rem;
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
    }

    /* Sección de administración */
    .admin-section {
      border-top: 2px solid var(--color-warning);
      background: linear-gradient(180deg, rgba(255, 193, 7, 0.05) 0%, transparent 100%);
    }

    .admin-section .section-title {
      color: var(--color-warning);
      font-weight: var(--font-weight-bold);
    }

    .admin-section .nav-item {
      border-left: 3px solid transparent;
    }

    .admin-section .nav-item:hover {
      background: rgba(255, 193, 7, 0.1);
      color: var(--color-warning);
      border-left: 3px solid var(--color-warning);
    }

    .admin-section .nav-item.active {
      background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, transparent 100%);
      color: var(--color-warning);
      border-left: 3px solid var(--color-warning);
    }

    .admin-section .nav-item.active .nav-icon {
      color: var(--color-warning);
    }

    @media (max-width: 768px) {
      .sidebar {
        top: 60px;
        height: calc(100vh - 60px);
      }

      .toggle-btn {
        right: -38px;
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isCollapsed = signal(false); // Visible por defecto

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
