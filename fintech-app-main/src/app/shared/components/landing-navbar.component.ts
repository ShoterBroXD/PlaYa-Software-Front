import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="landing-navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="brand">
          <span class="brand-icon">P!</span>
          <span>PlaYa!</span>
        </a>

        <div class="navbar-search">
          <span class="search-icon" aria-hidden="true">/</span>
          <input type="search" placeholder="Buscar..." aria-label="Buscar en PlaYa" />
        </div>

        <nav class="navbar-links" aria-label="Secciones principales">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <button type="button" class="link" disabled>Categorias</button>
          <button type="button" class="link" disabled>Biblioteca</button>
          <button type="button" class="link" disabled>Comunidades</button>
        </nav>

        <div class="navbar-actions">
          <a routerLink="/login" class="btn btn-secondary">Iniciar Sesion</a>
          <a routerLink="/register" class="btn btn-primary">Crear cuenta</a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .landing-navbar {
      background: #ffffff;
      border-bottom: 1px solid rgba(13, 71, 161, 0.1);
      backdrop-filter: blur(6px);
    }

    .navbar-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.25rem 1.5rem;
      display: grid;
      grid-template-columns: auto minmax(0, 280px) 1fr auto;
      align-items: center;
      gap: 1.5rem;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.35rem;
      font-weight: 700;
      color: #0a3a75;
      text-decoration: none;
    }

    .brand-icon {
      font-size: 1.6rem;
    }

    .navbar-search {
      position: relative;
      display: flex;
      align-items: center;
      background: #f4f8ff;
      border-radius: 999px;
      padding: 0.35rem 1rem 0.35rem 2.2rem;
      border: 1px solid rgba(14, 129, 177, 0.2);
    }

    .navbar-search input {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 0.95rem;
      color: #0a2342;
      outline: none;
    }

    .search-icon {
      position: absolute;
      left: 0.9rem;
      color: #0e81b1;
      font-size: 1rem;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
    }

    .navbar-links a,
    .navbar-links .link {
      font-weight: 500;
      font-size: 0.95rem;
      color: #365b87;
      text-decoration: none;
      padding: 0.35rem 0.5rem;
      border-radius: 8px;
      transition: color 0.2s ease, background 0.2s ease;
    }

    .navbar-links a:hover,
    .navbar-links a.active,
    .navbar-links .link:hover {
      color: #0a3a75;
      background: rgba(14, 129, 177, 0.12);
    }

    .navbar-links .link {
      background: transparent;
      border: none;
      cursor: not-allowed;
      color: rgba(54, 91, 135, 0.5);
      pointer-events: none;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.6rem 1.4rem;
      border-radius: 999px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      border: 1px solid transparent;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-secondary {
      background: transparent;
      color: #0a3a75;
      border-color: rgba(14, 129, 177, 0.4);
    }

    .btn-secondary:hover {
      transform: translateY(-1px);
      border-color: #0a3a75;
    }

    .btn-primary {
      background: #0e81b1;
      color: #ffffff;
      box-shadow: 0 10px 24px rgba(14, 129, 177, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(14, 129, 177, 0.3);
    }

    @media (max-width: 1024px) {
      .navbar-inner {
        grid-template-columns: auto 1fr;
        grid-template-areas:
          'brand actions'
          'search search'
          'links links';
        row-gap: 1rem;
      }

      .brand {
        grid-area: brand;
      }

      .navbar-actions {
        grid-area: actions;
        justify-self: end;
      }

      .navbar-search {
        grid-area: search;
      }

      .navbar-links {
        grid-area: links;
      }

      .navbar-links {
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }

    @media (max-width: 640px) {
      .navbar-inner {
        padding: 1rem 1.25rem;
      }

      .navbar-actions {
        gap: 0.5rem;
      }

      .btn {
        padding: 0.55rem 1.1rem;
        font-size: 0.9rem;
      }

      .navbar-links {
        gap: 0.75rem;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .navbar-actions {
        width: 100%;
        justify-content: space-between;
      }

      .btn {
        flex: 1;
        text-align: center;
      }
    }
  `]
})
export class LandingNavbarComponent {}
