import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SongService } from '../../../core/services/song.service';
import { PlayerService } from '../../../core/services/player.service';
import { SongResponseDto } from '../../../core/models/song.model';
import { Track } from '../../../core/models/player.model';
import { SongRatingComponent } from '../../../shared/components/song-rating/song-rating.component';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-categories-tracks',
  standalone: true,
  imports: [CommonModule, RouterLink, SongRatingComponent, ReportModalComponent],
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class CategoriesTracksComponent implements OnInit {
  songs: SongResponseDto[] = [];
  isLoading = true;
  error: string | null = null;

  // Tracks de ejemplo para UI
  tracks = [
    { id: 1, artist: 'Messi', title: 'Mundial (track)', duration: '1:23', image: '/assets/img/icons/pop.png' },
    { id: 2, artist: 'Otro-artista', title: 'Otra-pista', duration: '2:34', image: '/assets/img/icons/rap.jpg' },
    { id: 3, artist: 'Tercer-artista', title: 'Tercera-pista', duration: '3:45', image: '/assets/img/icons/rock.jpeg' }
  ];

  // Modal y UI state
  showReportModal = signal(false);
  selectedTrackId = signal<number | null>(null);
  openDropdowns = signal<Set<number>>(new Set());

  genreId: number | null = null;
  genreName: string = '';

  constructor(
    private songService: SongService,
    private playerService: PlayerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Obtener el parámetro de género de la ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('genreId');
      this.genreId = id ? Number(id) : null;
      this.loadPublicSongs();
    });
  }

  loadPublicSongs() {
    this.isLoading = true;
    this.error = null;

    this.songService.getPublicSongs().subscribe({
      next: (songs) => {
        if (songs && songs.length) {
          // Filtrar por género si hay un genreId
          if (this.genreId) {
            this.songs = songs.filter(song => song.genre?.idGenre === this.genreId);
            this.genreName = this.songs[0]?.genre?.name || '';

            if (this.songs.length === 0) {
              this.error = `No hay canciones disponibles para este género.`;
            }
          } else {
            this.songs = songs;
          }

          // Filtrar contenido reportado localmente
          const hiddenIds = this.getHiddenContentIds();
          if (hiddenIds.length > 0) {
            this.songs = this.songs.filter(s => !hiddenIds.includes(s.idSong));
          }
        } else {
          this.songs = this.buildFallbackSongs();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading public songs:', err);
        this.error = 'No se pudieron cargar las canciones. Mostramos datos de ejemplo.';
        this.songs = this.buildFallbackSongs();
        this.isLoading = false;
      }
    });
  }

  playSong(song: SongResponseDto) {
    const track: Track = {
      id: song.idSong,
      title: song.title,
      artist: song.artist?.name || 'Artista desconocido',
      album: song.genre?.name || 'Sencillo',
      duration: song.duration || 0,
      coverImage: song.coverURL,
      audioUrl: song.fileURL,
      likes: 0, // TODO: Obtener likes reales si están disponibles
      comments: 0 // TODO: Obtener comentarios reales si están disponibles
    };

    this.playerService.playTrack(track);
  }

  onRatingChanged(songId: number, event: { rating: number; averageRating: number }) {
    console.log(`Canción ${songId} calificada con ${event.rating} estrellas`);
    console.log(`Nuevo promedio: ${event.averageRating}`);

    // Actualizar la canción en el array local
    const song = this.songs.find(s => s.idSong === songId);
    if (song) {
      song.averageRating = event.averageRating;
      song.ratingCount = (song.ratingCount || 0) + 1;
    }
  }

  formatDuration(seconds?: number): string {
    if (!seconds || Number.isNaN(seconds)) {
      return '--:--';
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(date?: string | Date): string {
    if (!date) {
      return '--';
    }

    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsedDate.getTime())) {
      return '--';
    }

    return parsedDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  toggleDropdown(trackId: number) {
    const open = this.openDropdowns();
    if (open.has(trackId)) {
      open.delete(trackId);
    } else {
      open.add(trackId);
    }
    this.openDropdowns.set(new Set(open));
  }

  isDropdownOpen(trackId: number): boolean {
    return this.openDropdowns().has(trackId);
  }

  openReportModal(trackId: number) {
    this.selectedTrackId.set(trackId);
    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedTrackId.set(null);
  }

  onReportSubmitted() {
    const reportedId = this.selectedTrackId();
    if (reportedId) {
      this.saveHiddenContentId(reportedId);
      // Remover inmediatamente de la lista local
      this.songs = this.songs.filter(s => s.idSong !== reportedId);
    }
    this.closeReportModal();
    alert('Contenido reportado. Ya no verás esta canción.');
  }

  private getHiddenContentIds(): number[] {
    const stored = localStorage.getItem('hidden_content_ids');
    return stored ? JSON.parse(stored) : [];
  }

  private saveHiddenContentId(id: number) {
    const ids = this.getHiddenContentIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem('hidden_content_ids', JSON.stringify(ids));
    }
  }

  private buildFallbackSongs(): SongResponseDto[] {
    return this.tracks.map((track) => ({
      idSong: track.id,
      idUser: 0,
      title: track.title,
      description: '',
      coverURL: track.image,
      fileURL: '', // URL vacía para fallback
      visibility: 'public',
      duration: this.parseDurationLabel(track.duration),
      uploadDate: new Date(),
      artist: {
        idUser: 0,
        name: track.artist
      },
      averageRating: 0,
      ratingCount: 0
    }));
  }

  private parseDurationLabel(label: string): number {
    const [minutes, seconds] = label.split(':').map((value) => Number(value));
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
      return 0;
    }
    return minutes * 60 + seconds;
  }
}
