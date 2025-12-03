import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
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
  playlistCounts: Map<number, number> = new Map();
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

  constructor(private playlistService: PlaylistService, private router: Router) { }

  openPlaylist(playlist: PlaylistResponseDto) {
    if (playlist && playlist.id) {
      this.router.navigate(['/playlists', playlist.id], { state: { from: this.router.url } });
    } else {
      console.error('Invalid playlist id for navigation', playlist);
    }
  }

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
        const normalized = this.normalizePlaylists(data);
        if (normalized && normalized.length) {
          this.playlists = normalized;
          this.loadSongCounts();
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

  loadSongCounts(): void {
    this.playlists.forEach(playlist => {
      // Optimización: Si ya tenemos las canciones, usar ese dato
      if (playlist.songs && playlist.songs.length > 0) {
        this.playlistCounts.set(playlist.id, playlist.songs.length);
        return;
      }

      const id = playlist.id;
      // Solo intentar cargar si tenemos un ID válido
      if (Number.isFinite(id)) {
        this.playlistService.getSongCountByPlaylistId(id).subscribe({
          next: (count) => {
            this.playlistCounts.set(id, count);
          },
          error: (err) => {
            // Silenciar error 403 si ocurre y no hacer nada
            if (err.status !== 403) {
              console.warn('Error loading song count for playlist', id, err);
            }
          }
        });
      }
    });
  }

  getSongCount(playlist: PlaylistResponseDto): number {
    return this.playlistCounts.get(playlist.id) ?? playlist.songs?.length ?? 0;
  }

  // Normalization methods
  private normalizePlaylists(data: PlaylistResponseDto[] | any): PlaylistResponseDto[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((raw, index) => this.normalizePlaylist(raw, index));
  }

  private normalizePlaylist(raw: any, index: number): PlaylistResponseDto {
    const normalizedSongs = this.normalizeSongs(
      raw?.songs ??
      raw?.songResponses ??
      raw?.tracks ??
      raw?.songList ??
      []
    );

    return {
      id: this.ensureNumber(raw?.id ?? raw?.idPlaylist ?? raw?.playlistId, index),
      idUser: this.ensureNumber(raw?.idUser ?? raw?.userId ?? raw?.ownerId, 0),
      name: raw?.name ?? raw?.title ?? 'Playlist sin nombre',
      description: raw?.description ?? raw?.details ?? '',
      creationDate: raw?.creationDate ?? raw?.createdAt ?? new Date().toISOString(),
      visible: raw?.visible ?? raw?.isPublic ?? true,
      songs: normalizedSongs
    };
  }

  private normalizeSongs(rawSongs: any): any[] {
    if (!Array.isArray(rawSongs)) {
      return [];
    }

    return rawSongs.map((song) => ({
      idSong: this.ensureNumber(song?.idSong ?? song?.id ?? song?.songId, 0),
      idUser: this.ensureNumber(song?.idUser ?? song?.userId ?? song?.artistId, 0),
      title: song?.title ?? song?.name ?? 'Canción sin título',
      description: song?.description ?? '',
      coverURL: song?.coverURL ?? song?.cover ?? song?.imageURL ?? '',
      fileURL: song?.fileURL ?? song?.url ?? '',
      visibility: song?.visibility ?? 'public',
      uploadDate: song?.uploadDate ?? song?.date ?? new Date().toISOString()
    }));
  }

  private ensureNumber(value: any, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
