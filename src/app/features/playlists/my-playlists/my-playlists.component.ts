import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlaylistResponseDto, SongResponseDto } from '../../../core/models/playlist.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-my-playlists',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-playlists.component.html',
  styleUrls: ['./my-playlists.component.css'],
})
export class MyPlaylistsComponent implements OnInit {
  playlists: PlaylistResponseDto[] = [];
  loading = false;
  errorMessage = '';
  isUsingFallback = false;

  private readonly fallbackPlaylists: PlaylistResponseDto[] = [
    {
      id: 101,
      idUser: 0,
      name: 'Exitos para concentrarse',
      description: 'Lo mejor del lo-fi y chill para estudiar.',
      creationDate: new Date().toISOString(),
      visible: true,
      songs: []
    },
    {
      id: 102,
      idUser: 0,
      name: 'Morning Boost',
      description: 'Energía para comenzar el día con ánimo.',
      creationDate: new Date().toISOString(),
      visible: true,
      songs: []
    }
  ];

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      switchMap((user: any) => {
        this.loading = true;
        this.errorMessage = '';
        this.isUsingFallback = false;

        const userId = user?.idUser || this.resolveUserId();

        if (userId) {
          return this.playlistService.getPlaylistsByUser(userId);
        } else {
          this.useFallback('No se pudo identificar al usuario. Mostrando playlists de ejemplo.');
          return of([] as PlaylistResponseDto[]);
        }
      })
    ).subscribe({
      next: (data) => {
        // Si data es vacío y estamos usando fallback, no sobrescribir
        if (this.isUsingFallback) return;

        const normalized = this.normalizePlaylists(data);
        if (normalized.length) {
          this.playlists = normalized;
          this.errorMessage = '';
        } else {
          this.useFallback('Todavía no tienes playlists. Aquí tienes algunas sugerencias.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando playlists', error);
        this.useFallback('No pudimos cargar tus playlists reales. Mostramos ejemplos.');
      },
    });
  }

  // loadPlaylists ya no es necesario como método público separado
  loadPlaylists(userId: number | null = null): void {
    // Deprecated
  }


  deletePlaylist(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta playlist?')) {
      this.playlistService.deletePlaylist(id).subscribe({
        next: () => {
          this.loadPlaylists(); // Recargar lista
        },
        error: (error) => {
          console.error('Error eliminando playlist', error);
          alert('Error al eliminar la playlist.');
        },
      });
    }
  }

  private resolveUserId(): number | null {
    const directId = this.authService.getUserId();
    if (directId) {
      return directId;
    }

    const storedUser = this.authService.getCurrentUser();
    if (storedUser?.idUser) {
      return storedUser.idUser;
    }

    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed?.idUser) {
          return parsed.idUser;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    return null;
  }

  private useFallback(message: string): void {
    this.playlists = this.getFallbackPlaylists();
    this.errorMessage = message;
    this.isUsingFallback = true;
    this.loading = false;
  }

  private getFallbackPlaylists(): PlaylistResponseDto[] {
    return this.fallbackPlaylists.map((playlist, index) => ({
      ...playlist,
      id: playlist.id + index
    }));
  }

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

  private normalizeSongs(rawSongs: any): SongResponseDto[] {
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
