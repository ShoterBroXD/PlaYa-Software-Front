import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { PlaylistResponseDto } from '../../../core/models/playlist.model';

@Component({
  selector: 'app-categories-playlists',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.css']
})
export class CategoriesPlaylistsComponent implements OnInit {
  playlists: PlaylistResponseDto[] = [];
  loading = false;
  errorMessage = '';
  isFallback = false;

  private readonly fallbackPlaylists: PlaylistResponseDto[] = [
    {
      id: 201,
      idUser: 0,
      name: 'Descubrimientos semanales',
      description: 'Canciones frescas de la comunidad para inspirarte.',
      creationDate: new Date().toISOString(),
      visible: true,
      songs: []
    },
    {
      id: 202,
      idUser: 0,
      name: 'Lo mejor de PlaYa!',
      description: 'Selección curada con los temas más populares.',
      creationDate: new Date().toISOString(),
      visible: true,
      songs: []
    }
  ];

  constructor(private playlistService: PlaylistService) {}

  // Gradientes para playlists en tonos azules
  private readonly playlistGradients = [
    'linear-gradient(135deg, #0a6e99 0%, #084f6a 100%)',
    'linear-gradient(135deg, #3498db 0%, #2874a6 100%)',
    'linear-gradient(135deg, #5dade2 0%, #1f618d 100%)',
    'linear-gradient(135deg, #85c1e9 0%, #2980b9 100%)',
    'linear-gradient(135deg, #1e90ff 0%, #0066cc 100%)',
    'linear-gradient(135deg, #4a90e2 0%, #2e5c8a 100%)',
  ];

  getPlaylistGradient(index: number): string {
    return this.playlistGradients[index % this.playlistGradients.length];
  }

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.loading = true;
    this.errorMessage = '';
    this.isFallback = false;

    this.playlistService.getAllPlaylists().subscribe({
      next: (data) => {
        if (data && data.length) {
          this.playlists = data;
        } else {
          this.useFallback('Aún no hay playlists públicas. Mira estas sugerencias.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando playlists públicas', error);
        this.useFallback('No se pudieron cargar las playlists reales. Mostramos ejemplos.');
      },
    });
  }

  private useFallback(message: string): void {
    this.errorMessage = message;
    this.playlists = this.fallbackPlaylists.map((playlist, index) => ({
      ...playlist,
      id: playlist.id + index
    }));
    this.loading = false;
    this.isFallback = true;
  }
}
