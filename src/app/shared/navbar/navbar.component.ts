import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { AuthService } from '../../core/services/auth.service';
import { SearchService, SearchResults } from '../../core/services/search.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, NotificationsComponent, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private searchService = inject(SearchService);
  private router = inject(Router);
  private authService = inject(AuthService);

  query = signal('');
  searchResults = signal<SearchResults | null>(null);
  showDropdown = signal(false);
  isSearching = signal(false);

  private searchSubject = new Subject<string>();

  constructor() {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length >= 2) {
          this.isSearching.set(true);
          return this.searchService.search(query);
        }
        return [];
      })
    ).subscribe({
      next: (results: any) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
        this.showDropdown.set(true);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.isSearching.set(false);
      }
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    
    if (value.length >= 2) {
      this.searchSubject.next(value);
    } else {
      this.searchResults.set(null);
      this.showDropdown.set(false);
    }
  }

  onSearchFocus() {
    if (this.searchResults()) {
      this.showDropdown.set(true);
    }
  }

  onSearchBlur() {
    // Delay para permitir clicks en el dropdown
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  navigateToGenres() {
    this.closeDropdown();
    this.router.navigate(['/categories']);
  }

  navigateToArtists() {
    this.closeDropdown();
    this.router.navigate(['/artists/explore']);
  }

  navigateToSongs() {
    this.closeDropdown();
    this.router.navigate(['/categories/tracks']);
  }

  navigateToPlaylists() {
    this.closeDropdown();
    this.router.navigate(['/playlists']);
  }

  navigateToCommunities() {
    this.closeDropdown();
    this.router.navigate(['/communities']);
  }

  search() {
    // Mantener funcionalidad del botón (por si acaso)
    const q = this.query();
    if (!q.trim()) return;
    // Ya no navegamos a /search, el overlay maneja todo
  }

  goHome() {
    this.router.navigate([this.getHomeRoute()]);
  }

  getHomeRoute(): string {
    const type = this.authService.resolveUserType();

    if (type === 'LISTENER') {
      return '/dashboard-usuario';
    } else if (type === 'ARTIST') {
      return '/dashboard-artista';
    }

    return '/home';
  }
}
