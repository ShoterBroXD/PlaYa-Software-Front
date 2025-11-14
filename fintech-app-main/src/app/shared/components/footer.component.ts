import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p class="footer-text">&copy; 2025 <span class="brand">FinTech</span> App. Todos los derechos reservados by <span class="company">HampCode</span>.</p>
       
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2d3748;
      color: var(--color-text-light);
      padding: var(--spacing-xl);
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .footer-text {
      color: #e2e8f0;
      margin: 0;
    }

    .brand {
      color: #fbbf24;
      font-weight: var(--font-weight-semibold);
    }

    .company {
      color: #10b981;
      font-weight: var(--font-weight-semibold);
    }

    .footer-links {
      display: flex;
      gap: var(--spacing-xl);
    }

    .footer-links a {
      color: #cbd5e0;
      text-decoration: none;
      transition: var(--transition-base);
      font-weight: var(--font-weight-medium);
    }

    .footer-links a:hover {
      color: #fbbf24;
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
      }

      .footer-links {
        flex-direction: column;
        gap: var(--spacing-sm);
      }
    }
  `]
})
export class FooterComponent {}
