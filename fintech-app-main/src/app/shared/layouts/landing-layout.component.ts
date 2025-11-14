import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="landing-layout">
      <header class="landing-header">
        <div class="header-content">
          <a routerLink="/" class="logo">
            <span class="logo-icon">💎</span>
            <span class="logo-text">FinTech<span class="logo-highlight">App</span></span>
          </a>
        </div>
      </header>

      <main class="landing-main">
        <router-outlet />
      </main>

      <footer class="landing-footer">
        <p>&copy; 2025 FinTech App. Todos los derechos reservados by HampCode.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      --color-primary: #003D7A;
      --color-secondary: #00A859;
      --color-light: #F5F5F5;
      --color-white: #FFFFFF;
    }

    .landing-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--color-light);
    }

    .landing-header {
      background: var(--color-white);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem 2rem;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      color: var(--color-primary);
    }

    .logo-highlight {
      color: var(--color-secondary);
    }

    .landing-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .landing-footer {
      background: var(--color-primary);
      padding: 1.5rem;
      text-align: center;
      color: var(--color-white);
    }

    .landing-footer p {
      margin: 0;
      opacity: 0.8;
    }
  `]
})
export class LandingLayoutComponent {}
