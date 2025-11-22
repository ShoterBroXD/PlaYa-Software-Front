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
          alert('⚠️ Backend no disponible\n\nEl servidor no está corriendo. Para probar la funcionalidad:\n\n1. Inicia el backend Spring Boot en http://localhost:8080\n2. Verifica que la API /api/v1/songs esté activa\n\nLa interfaz seguirá mostrando datos de ejemplo.');
        } else {
          alert('Error al guardar la calificación: ' + error.message);
        }
        
        this.isSubmitting = false;
      }
    });
  }

  getStarClass(star: number): string {
    if (this.hoverRating > 0) {
      return star <= this.hoverRating ? 'star-filled' : 'star-empty';
    }
    if (this.userRating > 0) {
      return star <= this.userRating ? 'star-user-rated' : 'star-empty';
    }
    return star <= Math.round(this.currentRating) ? 'star-filled' : 'star-empty';
  }

  getRatingText(): string {
    if (this.currentRating === 0) {
      return 'Sin calificaciones';
    }
    return `${this.currentRating.toFixed(1)} (${this.ratingCount} ${this.ratingCount === 1 ? 'calificación' : 'calificaciones'})`;
  }
}
