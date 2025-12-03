import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-song-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-rating.component.html',
  styleUrls: ['./song-rating.component.css']
})
export class SongRatingComponent implements OnInit {
  @Input() songId!: number;
  @Input() currentRating: number = 0;
  @Input() ratingCount: number = 0;
  @Input() readonly: boolean = false;
  @Output() ratingChanged = new EventEmitter<{ rating: number; averageRating: number }>();

  stars: number[] = [1, 2, 3, 4, 5];
  hoverRating: number = 0;
  userRating: number = 0;
  isSubmitting: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private songService: SongService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = !!this.authService.getToken();
    console.log('SongRatingComponent initialized:', {
      songId: this.songId,
      currentRating: this.currentRating,
      ratingCount: this.ratingCount,
      isAuthenticated: this.isAuthenticated
    });

    // Cargar la calificación del usuario si está autenticado
    if (this.isAuthenticated) {
      // Primero cargar desde localStorage (instantáneo)
      this.loadUserRatingFromLocalStorage();
      // Luego verificar con el backend (ahora que está implementado)
      this.loadUserRating();
    }
  }

  private loadUserRatingFromLocalStorage() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const key = `song_rating_${userId}_${this.songId}`;
    const savedRating = localStorage.getItem(key);

    if (savedRating) {
      const rating = parseInt(savedRating, 10);
      if (rating > 0 && rating <= 5) {
        this.userRating = rating;
        console.log(`Calificación cargada desde localStorage: ${rating} estrellas`);
      }
    }
  }

  private saveUserRatingToLocalStorage(rating: number) {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const key = `song_rating_${userId}_${this.songId}`;
    localStorage.setItem(key, rating.toString());
    console.log(`Calificación guardada en localStorage: ${rating} estrellas`);
  }

  private loadUserRating() {
    this.songService.getUserRating(this.songId).subscribe({
      next: (rating) => {
        if (rating !== null && rating > 0) {
          // Backend devolvió una calificación válida
          this.userRating = rating;
          console.log(`Usuario ya calificó esta canción con ${rating} estrellas (desde backend)`);
          // Sincronizar con localStorage
          this.saveUserRatingToLocalStorage(rating);
        } else {
          // Backend devolvió null (204 No Content - usuario no ha calificado)
          // Si localStorage ya tiene un valor, MANTENERLO
          if (this.userRating > 0) {
            console.log(`Backend no tiene calificación, manteniendo localStorage: ${this.userRating} estrellas`);
          } else {
            console.log('Usuario no ha calificado esta canción');
          }
        }
      },
      error: (error) => {
        // Error de red o servidor, mantener valor de localStorage
        console.log('Error al cargar calificación del backend, manteniendo valor actual:', this.userRating);
      }
    });
  }

  onStarHover(rating: number) {
    if (!this.readonly && this.isAuthenticated) {
      this.hoverRating = rating;
    }
  }

  onStarLeave() {
    this.hoverRating = 0;
  }

  rateSong(rating: number) {
    if (this.readonly || !this.isAuthenticated || this.isSubmitting) {
      if (!this.isAuthenticated) {
        alert('Debes iniciar sesión para calificar canciones');
      }
      return;
    }

    // Confirmación si el rating es bajo (menor a 3)
    if (rating < 3) {
      const confirm = window.confirm(
        `¿Estás seguro de calificar esta canción con ${rating} estrella${rating > 1 ? 's' : ''}? Esta es una calificación baja.`
      );
      if (!confirm) {
        return;
      }
    }

    this.isSubmitting = true;
    console.log(`Enviando calificación ${rating} para canción ${this.songId}`);

    this.songService.rateSong(this.songId, rating).subscribe({
      next: (response) => {
        console.log('Calificación enviada exitosamente:', response);
        this.userRating = rating;
        this.currentRating = response.averageRating || rating;
        this.ratingCount = response.ratingCount || 1;
        this.isSubmitting = false;

        // Guardar en localStorage para persistencia
        this.saveUserRatingToLocalStorage(rating);

        // Emitir evento con la nueva calificación
        this.ratingChanged.emit({
          rating: rating,
          averageRating: this.currentRating
        });

        alert(`¡Gracias por calificar! Tu calificación de ${rating} estrella${rating > 1 ? 's' : ''} ha sido guardada.`);
      },
      error: (error) => {
        console.error('Error al calificar canción:', error);

        if (error.message.includes('conectar al servidor')) {
          alert('⚠️ Backend no disponible\n\nEl servidor en Render no responde. Verifica:\n\n1. Que el servicio en Render esté activo\n2. Que la URL https://playa-software.onrender.com esté accesible\n\nLa interfaz seguirá mostrando datos de ejemplo.');
        } else {
          alert('Error al guardar la calificación: ' + error.message);
        }

        this.isSubmitting = false;
      }
    });
  }

  getStarClass(star: number): string {
    // Si está hovering, mostrar preview amarillo
    if (this.hoverRating > 0) {
      return star <= this.hoverRating ? 'star-filled' : 'star-empty';
    }

    // Si el usuario ya calificó, mostrar su calificación en amarillo
    if (this.userRating > 0) {
      return star <= this.userRating ? 'star-user-rated' : 'star-empty';
    }

    // Si el usuario NO ha calificado, mostrar TODAS las estrellas en gris
    // (sin importar el promedio de calificaciones de otros usuarios)
    return 'star-empty';
  }

  getRatingText(): string {
    if (this.currentRating === 0) {
      return 'Sin calificaciones';
    }
    return `${this.currentRating.toFixed(1)} (${this.ratingCount} ${this.ratingCount === 1 ? 'calificación' : 'calificaciones'})`;
  }
}
