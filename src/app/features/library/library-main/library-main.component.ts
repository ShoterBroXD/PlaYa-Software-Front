import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { LikeService } from '../../../core/services/like.service';
import { Track } from '../../../core/models/player.model';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';
import { SongResponseDto } from '../../../core/models/song.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AddToPlaylistModalComponent } from '../../../shared/components/add-to-playlist-modal/add-to-playlist-modal.component';
import { SongRatingComponent } from '../../../shared/components/song-rating/song-rating.component';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-library-main',
  standalone: true,
  imports: [CommonModule, RouterLink, AddToPlaylistModalComponent, SongRatingComponent, ReportModalComponent],
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
  
  // Dropdown y modales
  openDropdowns = signal<Set<number>>(new Set());
  showShareModal = false;
  showRatingModal = signal(false);
  showReportModal = signal(false);
  selectedTrackId = signal<number | null>(null);
  selectedShareTrackId: number | null = null;
  songLikes = new Map<number, boolean>();

  constructor(
    private playerService: PlayerService,
    private songService: SongService,
    private authService: AuthService,
    private likeService: LikeService
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

  // Métodos del dropdown
  toggleDropdown(event: Event, trackId: number) {
    event.stopPropagation();
    const open = this.openDropdowns();
    if (open.has(trackId)) {
      open.delete(trackId);
    } else {
      open.clear();
      open.add(trackId);
    }
    this.openDropdowns.set(new Set(open));
  }

  isDropdownOpen(trackId: number): boolean {
    return this.openDropdowns().has(trackId);
  }

  toggleLike(trackId: number) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Usuario no autenticado');
      return;
    }

    const isLiked = this.songLikes.get(trackId) ?? false;
    this.songLikes.set(trackId, !isLiked);

    this.likeService.toggleLike(trackId, userId, isLiked).subscribe({
      next: (response) => {
        console.log('Like toggled:', response);
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        this.songLikes.set(trackId, isLiked);
      }
    });
    this.closeAllDropdowns();
  }

  shareSong(trackId: number) {
    this.selectedShareTrackId = trackId;
    this.showShareModal = true;
    this.closeAllDropdowns();
  }

  closeShareModal() {
    this.showShareModal = false;
    this.selectedShareTrackId = null;
  }

  shareOn(platform: string) {
    if (!this.selectedShareTrackId) return;
    
    const song = this.userSongs.find(s => s.idSong === this.selectedShareTrackId);
    if (!song) return;

    const shareUrl = `${window.location.origin}/song/${song.idSong}`;
    const text = `Escucha "${song.title}" de ${song.artist?.name || 'Artista'} en PlaYa`;

    let url = '';

    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('¡Enlace copiado! Pégalo en Instagram.');
        });
        this.closeShareModal();
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      this.closeShareModal();
    }
  }

  openRatingModal(trackId: number) {
    this.selectedTrackId.set(trackId);
    this.showRatingModal.set(true);
    this.closeAllDropdowns();
  }

  closeRatingModal() {
    this.showRatingModal.set(false);
    this.selectedTrackId.set(null);
  }

  get selectedSong(): SongResponseDto | undefined {
    const id = this.selectedTrackId();
    return id ? this.userSongs.find(s => s.idSong === id) : undefined;
  }

  onRatingChanged(songId: number, event: { rating: number; averageRating: number }) {
    console.log(`Canción ${songId} calificada con ${event.rating} estrellas`);
    const song = this.userSongs.find(s => s.idSong === songId);
    if (song) {
      song.averageRating = event.averageRating;
      song.ratingCount = (song.ratingCount || 0) + 1;
    }
  }

  openReportModal(trackId: number) {
    this.selectedTrackId.set(trackId);
    this.showReportModal.set(true);
    this.closeAllDropdowns();
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedTrackId.set(null);
  }

  onReportSubmitted() {
    const reportedId = this.selectedTrackId();
    if (reportedId) {
      this.userSongs = this.userSongs.filter(s => s.idSong !== reportedId);
    }
    this.closeReportModal();
    alert('Contenido reportado.');
  }

  closeAllDropdowns() {
    this.openDropdowns.set(new Set());
  }
}
