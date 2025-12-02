import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SongService } from '../../../core/services/song.service';
import { Genre } from '../../../core/models/genre.model';

@Component({
  selector: 'app-categories-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-index.component.html',
  styleUrls: ['./categories-index.component.css']
})
export class CategoriesIndexComponent implements OnInit {
  private songService = inject(SongService);
  private router = inject(Router);

  genres: Genre[] = [];
  isLoading = false;
  error: string | null = null;

  // Mapeo de gradientes en tonos azules coherentes con el estilo de PlaYa
  private readonly genreGradients: { [key: string]: string } = {
    'Rock': 'linear-gradient(135deg, #0a4d68 0%, #05364d 100%)',
    'Pop': 'linear-gradient(135deg, #1e90ff 0%, #0066cc 100%)',
    'Hip Hop': 'linear-gradient(135deg, #4a90e2 0%, #2e5c8a 100%)',
    'Rap': 'linear-gradient(135deg, #5dade2 0%, #2874a6 100%)',
    'Electronic': 'linear-gradient(135deg, #3498db 0%, #1f618d 100%)',
    'Reggaeton': 'linear-gradient(135deg, #5499c7 0%, #2e4053 100%)',
    'Indie': 'linear-gradient(135deg, #85c1e9 0%, #2980b9 100%)',
    'Trap': 'linear-gradient(135deg, #2c3e50 0%, #0a6e99 100%)',
    'Jazz': 'linear-gradient(135deg, #6ab0de 0%, #1a5276 100%)',
    'Cumbia': 'linear-gradient(135deg, #1b4f72 0%, #154360 100%)',
    'default': 'linear-gradient(135deg, #3498db 0%, #2874a6 100%)'
  };

  ngOnInit() {
    this.loadGenres();
  }

  loadGenres() {
    this.isLoading = true;
    this.error = null;

    this.songService.getGenres().subscribe({
      next: (genres: Genre[]) => {
        console.log('Géneros cargados desde el backend:', genres);
        this.genres = genres;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
        this.error = 'No se pudieron cargar los géneros. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  getGenreGradient(genreName: string): string {
    return this.genreGradients[genreName] || this.genreGradients['default'];
  }

  navigateToGenre(genreId: number) {
    this.router.navigate(['/categories/tracks', genreId]);
  }
}
