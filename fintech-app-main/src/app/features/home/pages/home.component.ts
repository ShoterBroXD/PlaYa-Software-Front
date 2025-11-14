import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingNavbarComponent } from '../../../shared/components/landing-navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LandingNavbarComponent],
  template: `
    <div class="home-page">
      <app-landing-navbar />

      <section class="hero">
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="hero-eyebrow">Escucha ahora</p>
            <h1>Escucha la mejor musica independiente y descubre nuevos talentos!</h1>
            <p class="hero-subtitle">
              Una plataforma para artistas emergentes donde compartir, descubrir y conectar.
            </p>
            <div class="hero-actions">
              <a routerLink="/login" class="btn btn-primary">Escuchar ahora</a>
              <a routerLink="/about" class="btn btn-outline">Aprender mas</a>
            </div>
          </div>
          <div class="hero-illustration" aria-hidden="true">
            <svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="190" width="280" height="70" rx="18" fill="#EBF4FF" />
              <path d="M90 200 L270 200" stroke="#1C5A99" stroke-width="10" stroke-linecap="round" />
              <circle cx="130" cy="230" r="35" fill="#0A3A75" />
              <circle cx="130" cy="230" r="12" fill="#FFFFFF" />
              <circle cx="230" cy="230" r="35" fill="#0A3A75" />
              <circle cx="230" cy="230" r="12" fill="#FFFFFF" />
              <path d="M175 180 C195 130 210 90 230 80" stroke="#0A3A75" stroke-width="8" stroke-linecap="round" />
              <path d="M200 120 Q215 80 250 70" stroke="#0A3A75" stroke-width="7" stroke-linecap="round" />
              <path d="M120 130 Q145 80 200 90" stroke="#0A3A75" stroke-width="7" stroke-linecap="round" />
              <path d="M140 80 C150 55 190 55 210 86" stroke="#0A3A75" stroke-width="12" stroke-linecap="round" />
              <path d="M150 70 Q165 35 210 38" stroke="#0A3A75" stroke-width="5" stroke-linecap="round" />
              <path d="M212 38 Q250 40 265 72" stroke="#0A3A75" stroke-width="5" stroke-linecap="round" />
              <path d="M260 110 C275 125 285 150 290 180" stroke="#1C5A99" stroke-width="7" stroke-linecap="round" />
              <path d="M110 120 C95 140 90 170 95 200" stroke="#1C5A99" stroke-width="7" stroke-linecap="round" />
              <circle cx="205" cy="110" r="18" fill="#0A3A75" />
              <circle cx="205" cy="110" r="6" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .home-page {
      min-height: 100vh;
      background: linear-gradient(180deg, #ffffff 0%, #f2f8ff 100%);
      color: #0a2342;
    }

    .hero {
      padding: 7rem 1.5rem 4rem;
    }

    .hero-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3rem;
      align-items: center;
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-eyebrow {
      font-weight: 600;
      color: #0e65a2;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      font-size: clamp(2.4rem, 4vw, 3.2rem);
      line-height: 1.15;
      color: #043264;
      margin: 0;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      max-width: 32ch;
      color: #31506b;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn {
      padding: 0.85rem 1.8rem;
      border-radius: 999px;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: 2px solid transparent;
    }

    .btn-primary {
      background: #0e81b1;
      color: #ffffff;
      box-shadow: 0 12px 24px rgba(14, 129, 177, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 28px rgba(14, 129, 177, 0.3);
    }

    .btn-outline {
      background: #ffffff;
      color: #0e81b1;
      border-color: rgba(14, 129, 177, 0.3);
    }

    .btn-outline:hover {
      transform: translateY(-2px);
      border-color: #0e81b1;
      box-shadow: 0 10px 20px rgba(14, 129, 177, 0.15);
    }

    .hero-illustration {
      justify-self: center;
      width: 100%;
      max-width: 380px;
      filter: drop-shadow(0 28px 60px rgba(4, 50, 100, 0.15));
    }

    .hero-illustration svg {
      width: 100%;
      height: auto;
    }

    @media (max-width: 900px) {
      .hero-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-copy {
        align-items: center;
      }

      .hero-actions {
        justify-content: center;
      }

      .hero {
        padding-top: 6rem;
      }
    }

    @media (max-width: 520px) {
      .hero {
        padding: 5.5rem 1rem 3rem;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class HomeComponent {}
