import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';
import { SongResponseDto } from '../../../core/models/song.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AddToPlaylistModalComponent } from '../../../shared/components/add-to-playlist-modal/add-to-playlist-modal.component';

@Component({
  selector: 'app-library-main',
  standalone: true,
  imports: [CommonModule, RouterLink, AddToPlaylistModalComponent],
  templateUrl: './library-main.component.html',
  styleUrls: ['./library-main.component.css']
})
export class LibraryMainComponent implements OnInit {
  userSongs: SongResponseDto[] = [];
  loading = false;
  errorMessage = '';

  // Modal state
  isModalOpen = signal(false);
  selectedSongIds: number[] = [];

  constructor(
    private playerService: PlayerService,
    private songService: SongService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.pipe(
      switchMap((user: any) => {
        if (user && user.idUser) {
          this.loading = true;
          return this.songService.getSongsByUser(user.idUser);
        } else {
          // Si no hay usuario en el stream, intentar resolverlo localmente
          const localId = this.authService.getUserId();
          if (localId) {
            this.loading = true;
            return this.songService.getSongsByUser(localId);
          }
          return of([] as SongResponseDto[]); // Retornar array vacío si no hay usuario
        }
      })
    ).subscribe({
      next: (songs) => {
        this.userSongs = songs || [];
        this.loading = false;
        console.log('Canciones del usuario cargadas:', songs);
      },
      error: (error) => {
        console.error('Error al cargar canciones del usuario:', error);
        this.errorMessage = 'Error al cargar tus canciones';
        this.loading = false;
      }
    });
  }

  playSong(song: SongResponseDto, list: SongResponseDto[]) {
    console.log('Song data from backend:', song);
    console.log('fileURL:', song.fileURL);

    // Convertir SongResponseDto a Track con URLs de Cloudinary
    const track: Track = {
      id: song.idSong,
      title: song.title,
      artist: song.artist?.name || 'Artista Desconocido',
      album: song.genre?.name || 'Sin álbum',
      duration: song.duration || 0,
      coverImage: song.coverURL || '/assets/img/images/img-placeholder.svg',
      audioUrl: song.fileURL || '', // URL de Cloudinary del audio
      likes: 0,
      comments: 0,
      isLiked: false
    };

    console.log('Reproduciendo canción:', track);

    // Convertir toda la lista a Track[]
    const queue: Track[] = list.map(s => ({
      id: s.idSong,
      title: s.title,
      artist: s.artist?.name || 'Artista Desconocido',
      album: s.genre?.name || 'Sin álbum',
      duration: s.duration || 0,
      coverImage: s.coverURL || '/assets/img/images/img-placeholder.svg',
      audioUrl: s.fileURL,
      likes: 0,
      comments: 0,
      isLiked: false
    }));

    const index = list.findIndex(s => s.idSong === song.idSong);
    this.playerService.playTrack(track, queue, index);
  }

  openAddToPlaylistModal(event: Event, songId: number) {
    event.stopPropagation(); // Evitar que se reproduzca la canción al hacer click
    this.selectedSongIds = [songId];
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedSongIds = [];
  }

  onSongsAdded() {
    console.log('Canciones añadidas a playlist');
    // Opcional: Mostrar notificación
  }
}
