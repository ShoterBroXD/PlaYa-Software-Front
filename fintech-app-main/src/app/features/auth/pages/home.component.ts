import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <h1>Bienvenido a FinTech App</h1>
      <p>Gestiona tus finanzas de manera segura y eficiente</p>
      <div class="actions">
        <a routerLink="/login" class="btn btn-primary">Iniciar Sesión</a>
        <a routerLink="/register" class="btn btn-secondary">Registrarse</a>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      text-align: center;
      padding: 2rem;
    }
    .actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
    }
    .btn-primary {
      background: #007bff;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class HomeComponent {}
