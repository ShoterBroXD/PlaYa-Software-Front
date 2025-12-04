import { Component, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { LikeService } from '../../../core/services/like.service';
import { AuthService } from '../../../core/services/auth.service';
import { Track } from '../../../core/models/player.model';
import { Subscription } from 'rxjs';
import { AddToPlaylistModalComponent } from '../../../shared/components/add-to-playlist-modal/add-to-playlist-modal.component';
import { SongRatingComponent } from '../../../shared/components/song-rating/song-rating.component';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';

interface HistoryItem {
  id: number;
  title: string;
  artist: string;
  year: string;
  image: string;
  audioUrl: string;
  timestamp: number;
}

@Component({
  selector: 'app-library-history',
  standalone: true,
  imports: [CommonModule, AddToPlaylistModalComponent, SongRatingComponent, ReportModalComponent],
  templateUrl: './library-history.component.html',
  styleUrls: ['./library-history.component.css']
})
export class LibraryHistoryComponent implements OnInit, OnDestroy {
  history: HistoryItem[] = [];
  private readonly HISTORY_KEY = 'listening_history';
  private readonly MAX_HISTORY_ITEMS = 50;

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
    private likeService: LikeService,
    private authService: AuthService
  ) {
    // Monitorear cuando cambia la canción actual
    effect(() => {
      const track = this.playerService.currentTrack();
      if (track) {
        this.addToHistory(track);
      }
    });
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  private addToHistory(track: Track): void {
    const historyItem: HistoryItem = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      year: new Date().getFullYear().toString(),
      image: track.coverImage || '/assets/img/images/img-placeholder.svg',
      audioUrl: track.audioUrl,
      timestamp: Date.now()
    };

    // Remover duplicados (mismo ID)
    this.history = this.history.filter(item => item.id !== track.id);

    // Agregar al inicio
    this.history.unshift(historyItem);

    // Limitar tamaño del historial
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
    }

    this.saveHistory();
  }

  clearHistory(): void {
    if (confirm('¿Estás seguro de que deseas borrar todo tu historial?')) {
      this.history = [];
      this.saveHistory();
    }
  }

  playSong(song: HistoryItem): void {
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      coverImage: song.image,
      audioUrl: song.audioUrl,
      duration: 0,
      isLiked: false,
      likes: 0,
      comments: 0
    };
    this.playerService.playTrack(track);
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
    
    const song = this.history.find(s => s.id === this.selectedShareTrackId);
    if (!song) return;

    const shareUrl = `${window.location.origin}/song/${song.id}`;
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

  get selectedSong(): HistoryItem | undefined {
    const id = this.selectedTrackId();
    return id ? this.history.find(s => s.id === id) : undefined;
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
      this.history = this.history.filter(s => s.id !== reportedId);
      this.saveHistory();
    }
    this.closeReportModal();
    alert('Contenido reportado.');
  }

  closeAllDropdowns() {
    this.openDropdowns.set(new Set());
  }
}
