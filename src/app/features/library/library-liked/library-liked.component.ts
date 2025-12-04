import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikeService } from '../../../core/services/like.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';
import { AddToPlaylistModalComponent } from '../../../shared/components/add-to-playlist-modal/add-to-playlist-modal.component';
import { SongRatingComponent } from '../../../shared/components/song-rating/song-rating.component';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-library-liked',
  standalone: true,
  imports: [CommonModule, AddToPlaylistModalComponent, SongRatingComponent, ReportModalComponent],
  templateUrl: './library-liked.component.html',
  styleUrls: ['./library-liked.component.css']
})
export class LibraryLikedComponent implements OnInit {
  likedSongs: any[] = [];
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
    // Extraer nombre del artista de diferentes estructuras posibles
    let artistName = 'Artista'; // Valor por defecto más limpio
    if (raw?.artist?.name) {
      artistName = raw.artist.name;
    } else if (raw?.user?.name) {
      artistName = raw.user.name;
    } else if (raw?.artistName) {
      artistName = raw.artistName;
    } else if (raw?.artist && typeof raw.artist === 'string') {
      artistName = raw.artist;
    }

    const uploadYear = raw?.uploadDate ? new Date(raw.uploadDate).getFullYear().toString() : new Date().getFullYear().toString();

    return {
      idSong: raw?.idSong ?? raw?.id ?? 0,
      title: raw?.title ?? raw?.name ?? 'Sin título',
      artist: artistName,
      year: uploadYear,
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

  // Métodos del dropdown y modales
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

  openAddToPlaylistModal(event: Event, songId: number) {
    event.stopPropagation();
    this.selectedSongIds = [songId];
    this.isModalOpen.set(true);
    this.closeAllDropdowns();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedSongIds = [];
  }

  onSongsAdded() {
    console.log('Canciones añadidas a playlist');
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
    
    const song = this.likedSongs.find(s => s.idSong === this.selectedShareTrackId);
    if (!song) return;

    const shareUrl = `${window.location.origin}/song/${song.idSong}`;
    const text = `Escucha "${song.title}" de ${song.artist} en PlaYa`;

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

  get selectedSong(): any | undefined {
    const id = this.selectedTrackId();
    return id ? this.likedSongs.find(s => s.idSong === id) : undefined;
  }

  onRatingChanged(songId: number, event: { rating: number; averageRating: number }) {
    console.log(`Canción ${songId} calificada con ${event.rating} estrellas`);
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
      this.likedSongs = this.likedSongs.filter(s => s.idSong !== reportedId);
    }
    this.closeReportModal();
    alert('Contenido reportado.');
  }

  closeAllDropdowns() {
    this.openDropdowns.set(new Set());
  }
}
