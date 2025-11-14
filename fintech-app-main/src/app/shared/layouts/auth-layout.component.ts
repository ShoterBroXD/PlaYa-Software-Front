import { Component, inject, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarUserComponent } from '../components/navbar-user.component';
import { NavbarAdminComponent } from '../components/navbar-admin.component';
import { SidebarComponent } from '../components/sidebar.component';
import { FooterComponent } from '../components/footer.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarUserComponent, NavbarAdminComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="auth-layout">
      @if (isAdmin()) {
        <app-navbar-admin />
      } @else {
        <app-navbar-user />
      }

      <app-sidebar />

      <div class="content-wrapper" [class.sidebar-open]="true">
        <main class="auth-main">
          <router-outlet />
        </main>

        <app-footer />
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .content-wrapper {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 64px);
      margin-top: 64px;
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }

    .content-wrapper.sidebar-open {
      margin-left: 260px;
    }

    .auth-main {
      flex: 1;
      padding: 2rem;
      background: #f8f9fa;
      min-height: calc(100vh - 64px - 60px);
    }

    @media (max-width: 768px) {
      .content-wrapper {
        margin-top: 60px;
        min-height: calc(100vh - 60px);
      }

      .content-wrapper.sidebar-open {
        margin-left: 0;
      }

      .auth-main {
        min-height: calc(100vh - 60px - 60px);
      }
    }
  `]
})
export class AuthLayoutComponent {
  private authService = inject(AuthService);

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ROLE_ADMIN');
}
