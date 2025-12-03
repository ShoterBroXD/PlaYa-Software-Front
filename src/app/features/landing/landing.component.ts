import { Component } from '@angular/core';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar.component';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, PublicNavbarComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  searchQuery: string = '';

  constructor(private router: Router) { }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  onSearch(): void {
    // Por ahora solo muestra el término de búsqueda
    // Más adelante redirigirá a página de búsqueda
    console.log('Buscando:', this.searchQuery);
    // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }
}
