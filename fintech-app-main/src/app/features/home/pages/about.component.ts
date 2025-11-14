import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingNavbarComponent } from '../../../shared/components/landing-navbar.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, LandingNavbarComponent],
  template: `
    <div class="about-page">
      <app-landing-navbar />

      <section class="intro">
        <div class="intro-inner">
          <h2>Como funciona PlaYa!?</h2>
          <p>
            Conecta con nuevos talentos. Apoya, comenta y haz parte de una comunidad musical
            independiente compartiendo tus ideas con miles de artistas que buscan sobresalir.
          </p>
        </div>
      </section>

      <section class="audiences">
        <div class="audience-grid">
          <article class="audience-card">
            <h3>Para Artistas</h3>
            <p class="audience-subtitle">
              Sube tu musica facilmente, recibe retroalimentacion y crece junto a una comunidad
              apasionada por lo emergente.
            </p>
            <ul>
              <li>Perfil personalizado de artista</li>
              <li>Subida de canciones y albumes</li>
              <li>Estadisticas de oyentes y feedback</li>
              <li>Participacion en comunidades tematicas</li>
            </ul>
            <div class="audience-illustration" aria-hidden="true">
              <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 90 C20 50 70 20 110 35" stroke="#0A3A75" stroke-width="6" fill="none" stroke-linecap="round" />
                <path d="M80 40 C110 25 150 35 160 70" stroke="#0A3A75" stroke-width="6" fill="none" stroke-linecap="round" />
                <circle cx="130" cy="55" r="12" fill="#0A3A75" />
                <path d="M60 70 Q85 45 120 65" stroke="#0A3A75" stroke-width="4" fill="none" stroke-linecap="round" />
                <path d="M55 80 Q65 68 80 70" stroke="#0A3A75" stroke-width="4" fill="none" stroke-linecap="round" />
              </svg>
            </div>
          </article>

          <article class="audience-card">
            <h3>Para Oyentes</h3>
            <p class="audience-subtitle">
              Descubre nuevos sonidos, comenta tus favoritos y apoya a tus artistas independientes favoritos.
            </p>
            <ul>
              <li>Reproductor integrado</li>
              <li>Listas de descubrimiento personalizadas</li>
              <li>Espacios para comentar y valorar canciones</li>
              <li>Comunidades para compartir tus gustos</li>
            </ul>
            <div class="audience-illustration" aria-hidden="true">
              <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="40" width="120" height="60" rx="14" fill="#EBF4FF" />
                <circle cx="64" cy="70" r="18" fill="#0A3A75" />
                <circle cx="64" cy="70" r="7" fill="#FFFFFF" />
                <circle cx="116" cy="70" r="18" fill="#0A3A75" />
                <circle cx="116" cy="70" r="7" fill="#FFFFFF" />
                <rect x="84" y="48" width="12" height="6" rx="3" fill="#0A3A75" />
              </svg>
            </div>
          </article>
        </div>
      </section>

      <section class="cta">
        <div class="cta-inner">
          <a routerLink="/login" class="btn-primary">Escuchar ahora</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .about-page {
      background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%);
      color: #0a2342;
      min-height: 100vh;
    }

    .intro {
      padding: 6.5rem 1.5rem 2.5rem;
      text-align: center;
    }

    .intro-inner {
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    h2 {
      font-size: clamp(2.2rem, 4vw, 2.8rem);
      color: #043264;
      margin: 0;
    }

    .intro p {
      font-size: 1.1rem;
      color: #31506b;
      line-height: 1.6;
    }

    .audiences {
      padding: 1rem 1.5rem 3rem;
    }

    .audience-grid {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2rem;
    }

    .audience-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 2.4rem 2.2rem;
      box-shadow: 0 24px 56px rgba(4, 50, 100, 0.08);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      border: 1px solid rgba(14, 129, 177, 0.08);
    }

    .audience-card h3 {
      margin: 0;
      font-size: 1.6rem;
      color: #0a3a75;
    }

    .audience-subtitle {
      color: #31506b;
      line-height: 1.6;
    }

    ul {
      list-style: disc;
      padding-left: 1.2rem;
      color: #0a2342;
      line-height: 1.7;
    }

    li + li {
      margin-top: 0.5rem;
    }

    .audience-illustration {
      align-self: flex-end;
      width: 140px;
    }

    .audience-illustration svg {
      width: 100%;
      height: auto;
    }

    .cta {
      padding: 0 1.5rem 4rem;
    }

    .cta-inner {
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.85rem 1.9rem;
      border-radius: 999px;
      font-weight: 600;
      color: #ffffff;
      background: #0e81b1;
      text-decoration: none;
      box-shadow: 0 12px 26px rgba(14, 129, 177, 0.26);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 32px rgba(14, 129, 177, 0.3);
    }

    @media (max-width: 900px) {
      .audience-grid {
        grid-template-columns: 1fr;
      }

      .audience-illustration {
        align-self: center;
      }
    }

    @media (max-width: 540px) {
      .intro {
        padding: 6rem 1rem 2rem;
      }

      .audience-card {
        padding: 1.8rem 1.6rem;
      }

      .btn-primary {
        width: 100%;
      }
    }
  `]
})
export class AboutComponent {}
