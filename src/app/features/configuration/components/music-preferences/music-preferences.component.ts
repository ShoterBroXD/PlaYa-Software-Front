import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenreService } from '../../../../core/services/genre.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Genre } from '../../../../core/models/genre.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-music-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './music-preferences.component.html',
  styleUrls: ['./music-preferences.component.css']
})
export class MusicPreferencesComponent implements OnInit {
  private genreService = inject(GenreService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  @Output() preferencesUpdated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Estado
  availableGenres = signal<Genre[]>([]);
  selectedGenres = signal<string[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  message = signal<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Constantes
  readonly MAX_GENRES = 5;
  readonly MIN_GENRES = 1;

  ngOnInit(): void {
    console.log(' MusicPreferencesComponent initialized');
    this.loadGenres();
    this.loadUserPreferences();
  }

  /**
   * Carga todos los géneros disponibles
   */
  private loadGenres(): void {
    console.log(' Loading genres from backend...');
    this.isLoading.set(true);
    this.genreService.getAllGenres().subscribe({
      next: (genres) => {
        console.log(' Genres loaded successfully:', genres);
        this.availableGenres.set(genres);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(' Error loading genres:', error);
        this.showMessage('error', 'Error al cargar los géneros disponibles');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Decodifica el token JWT para extraer información
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  /**
   * Obtiene el ID del usuario desde múltiples fuentes
   */
  private getUserId(): number | null {
    // Intentar desde AuthService
    let userId = this.authService.getUserId();
    console.log('👤 User ID from AuthService:', userId);

    // Si no está, intentar desde currentUser
    if (!userId) {
      const currentUser = this.authService.getCurrentUser();
      console.log('👤 Current User:', currentUser);
      userId = currentUser?.idUser || null;
    }

    // Si aún no está, intentar desde localStorage directamente
    if (!userId) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user?.idUser || null;
          console.log('👤 User ID from localStorage:', userId);
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }

    // Si aún no está, intentar decodificar el token JWT
    if (!userId) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = this.decodeToken(token);
        console.log('🔑 Decoded token:', decoded);
        userId = decoded?.userId || null;
        console.log('👤 User ID from token:', userId);
      }
    }

    return userId;
  }

  /**
   * Carga las preferencias actuales del usuario
   */
  private loadUserPreferences(): void {
    const userId = this.getUserId();
    console.log('👤 Final User ID:', userId);
    if (!userId) {
      console.warn('⚠️ No user ID found');
      return;
    }

    // Intentar cargar desde localStorage primero
    const localPreferences = localStorage.getItem(`user_${userId}_preferences`);
    if (localPreferences) {
      try {
        const genres = JSON.parse(localPreferences);
        console.log(' Loaded preferences from localStorage:', genres);
        this.selectedGenres.set(genres);
      } catch (e) {
        console.error('Error parsing local preferences:', e);
      }
    }

    // Intentar cargar desde el backend
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        console.log(' User data loaded:', user);
        if (user.favoriteGenres && user.favoriteGenres.length > 0) {
          console.log(' User favorite genres from backend:', user.favoriteGenres);
          this.selectedGenres.set([...user.favoriteGenres]);
          // Sincronizar con localStorage
          localStorage.setItem(`user_${userId}_preferences`, JSON.stringify(user.favoriteGenres));
        }
      },
      error: (error) => {
        console.error(' Error loading user preferences from backend:', error);
        // Ya tenemos las preferencias de localStorage si existen
      }
    });
  }

  /**
   * Alterna la selección de un género
   * US-010 RB-010: Máximo 5 géneros
   */
  toggleGenre(genreName: string): void {
    const current = this.selectedGenres();
    const index = current.indexOf(genreName);

    if (index > -1) {
      // Quitar género
      this.selectedGenres.set(current.filter(g => g !== genreName));
    } else {
      // Agregar género (validar máximo)
      if (current.length >= this.MAX_GENRES) {
        this.showMessage('info', `Puedes seleccionar máximo ${this.MAX_GENRES} géneros`);
        return;
      }
      this.selectedGenres.set([...current, genreName]);
    }
  }

  /**
   * Verifica si un género está seleccionado
   */
  isGenreSelected(genreName: string): boolean {
    return this.selectedGenres().includes(genreName);
  }

  /**
   * Guarda las preferencias musicales
   * US-010 Escenario 01: Recomendaciones actualizadas
   * US-010 Escenario 03: Sin cambio realizado
   */
  savePreferences(): void {
    // Escenario 03: Validar que se seleccionó al menos un género
    if (this.selectedGenres().length < this.MIN_GENRES) {
      this.showMessage('info', 'Debes seleccionar al menos una preferencia');
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario');
      this.showMessage('error', 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    console.log(' Saving preferences for user:', userId);
    console.log(' Selected genres:', this.selectedGenres());

    this.isSaving.set(true);

    // Guardar localmente en localStorage como respaldo
    localStorage.setItem(`user_${userId}_preferences`, JSON.stringify(this.selectedGenres()));

    // Escenario 01: Actualizar preferencias
    this.userService.updateUserPreferences(userId, this.selectedGenres()).subscribe({
      next: () => {
        console.log(' Preferences saved successfully');
        this.showMessage('success', 'Preferencias actualizadas. Las recomendaciones se adaptarán a tus gustos');
        this.isSaving.set(false);
        this.preferencesUpdated.emit();

        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        console.error(' Error saving preferences to backend:', error);
        // Aunque el backend falle, las preferencias están guardadas localmente
        this.showMessage('success', 'Preferencias guardadas localmente');
        this.isSaving.set(false);

        setTimeout(() => {
          this.closeModal();
          this.preferencesUpdated.emit();
        }, 1500);
      }
    });
  }

  /**
   * Reinicia las preferencias musicales
   * US-010 Escenario 02: Reinicio de preferencias
   * RB-010: Historial y likes quedan excluidos
   */
  resetPreferences(): void {
    if (!confirm('¿Estás seguro de que deseas reiniciar tus preferencias? Recibirás recomendaciones desde cero.')) {
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario');
      this.showMessage('error', 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    this.isSaving.set(true);

    // Limpiar localStorage
    localStorage.removeItem(`user_${userId}_preferences`);

    // Escenario 02: Resetear preferencias
    this.userService.resetUserPreferences(userId).subscribe({
      next: () => {
        this.selectedGenres.set([]);
        this.showMessage('success', 'Preferencias reiniciadas. Recibirás recomendaciones desde cero');
        this.isSaving.set(false);
        this.preferencesUpdated.emit();

        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al resetear preferencias:', error);
        // Limpiar localmente aunque el backend falle
        this.selectedGenres.set([]);
        this.showMessage('success', 'Preferencias reiniciadas localmente');
        this.isSaving.set(false);

        setTimeout(() => {
          this.closeModal();
          this.preferencesUpdated.emit();
        }, 1500);
      }
    });
  }

  /**
   * Muestra un mensaje temporal
   */
  private showMessage(type: 'success' | 'error' | 'info', text: string): void {
    this.message.set({ type, text });

    setTimeout(() => {
      this.message.set(null);
    }, 4000);
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.close.emit();
  }

  /**
   * Obtiene el texto del contador de géneros seleccionados
   */
  get selectedCountText(): string {
    const count = this.selectedGenres().length;
    return `${count} de ${this.MAX_GENRES} géneros seleccionados`;
  }
}
