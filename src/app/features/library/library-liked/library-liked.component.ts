import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikeService } from '../../../core/services/like.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';

@Component({
  selector: 'app-library-liked',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-liked.component.html',
  styleUrls: ['./library-liked.component.css']
})
export class LibraryLikedComponent implements OnInit {
  likedSongs: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private likeService: LikeService,
    private authService: AuthService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.loadLikedSongs();
  }

  loadLikedSongs(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.likeService.getLikedSongsByUser(userId).subscribe({
      next: (songs) => {
        this.likedSongs = songs.map(song => this.normalizeSong(song));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando canciones favoritas:', error);

        // Si es error 403 o 404, probablemente el endpoint no está implementado
        if (error.status === 403 || error.status === 404) {
          this.errorMessage = 'La función de canciones favoritas aún no está disponible en el backend.';
        } else {
          this.errorMessage = 'Error al cargar las canciones favoritas';
        }

        this.loading = false;
        this.likedSongs = []; // Asegurar array vacío
      }
    });
  }

  private normalizeSong(raw: any): any {
    return {
      idSong: raw?.idSong ?? raw?.id ?? 0,
      title: raw?.title ?? raw?.name ?? 'Sin título',
      artist: raw?.artist ?? raw?.artistName ?? 'Artista desconocido',
      year: raw?.uploadDate ? new Date(raw.uploadDate).getFullYear().toString() : '2024',
      image: raw?.coverURL ?? raw?.cover ?? '/assets/img/images/img-placeholder.svg',
      fileURL: raw?.fileURL ?? raw?.url ?? '',
      description: raw?.description ?? ''
    };
  }

  playSong(song: any): void {
    if (song.fileURL) {
      const track: Track = {
        id: song.idSong,
        title: song.title,
        artist: song.artist,
        coverImage: song.image,
        audioUrl: song.fileURL,
        duration: 0, // Se obtendrá del audio element
        isLiked: false,
        likes: 0,
        comments: 0
      };
      this.playerService.playTrack(track);
    }
  }
}
