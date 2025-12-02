import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlaylistResponseDto, SongResponseDto } from '../../../core/models/playlist.model';

@Component({
  selector: 'app-view-playlist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-playlist.component.html',
  styleUrls: ['./view-playlist.component.css'],
})
export class ViewPlaylistComponent implements OnInit {
  playlist: PlaylistResponseDto | null = null;
  addSongForm: FormGroup;
  loading = false;
  errorMessage = '';
  playlistId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistService: PlaylistService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.playlistId = +this.route.snapshot.paramMap.get('id')!;
    this.addSongForm = this.fb.group({
      songId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadPlaylist();
  }

  loadPlaylist(): void {
    if (!this.playlistId || isNaN(this.playlistId)) {
      this.errorMessage = 'ID de playlist inválido';
      return;
    }
    this.loading = true;
    this.playlistService.getPlaylistById(this.playlistId).subscribe({
      next: (data) => {
        this.playlist = this.normalizePlaylist(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando playlist', error);
        this.errorMessage = 'Error al cargar la playlist.';
        this.loading = false;
      },
    });
  }

  addSong(): void {
    if (this.addSongForm.invalid) return;

    const songId = this.addSongForm.value.songId;
    this.playlistService.addSongToPlaylist(this.playlistId, { idSong: songId }).subscribe({
      next: () => {
        this.loadPlaylist(); // Recargar
        this.addSongForm.reset();
      },
      error: (error) => {
        console.error('Error agregando canción', error);
        alert('Error al agregar la canción.');
      },
    });
  }

  removeSong(songId: number): void {
    this.playlistService.removeSongFromPlaylist(this.playlistId, songId).subscribe({
      next: () => {
        this.loadPlaylist();
      },
      error: (error) => {
        console.error('Error removiendo canción', error);
        alert('Error al remover la canción.');
      },
    });
  }

  sharePlaylist(): void {
    const url = `${window.location.origin}/playlists/${this.playlistId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Enlace copiado al portapapeles.');
    });
  }

  goBack(): void {
    // Try to navigate back to the origin route passed in navigation state
    const from = (window.history.state && window.history.state.from) ? window.history.state.from : null;
    if (from && typeof from === 'string') {
      // navigate to the previous route stored in state
      this.router.navigateByUrl(from).catch(() => window.history.back());
      return;
    }

    // Fallback to history.back() which will return to the actual previous page if available
    try {
      window.history.back();
    } catch (e) {
      // final fallback to the my playlists page
      this.router.navigate(['/playlists/my']);
    }
  }

  private normalizePlaylist(raw: PlaylistResponseDto | any): PlaylistResponseDto {
    const normalizedSongs = this.normalizeSongs(
      raw?.songs ??
      raw?.songResponses ??
      raw?.tracks ??
      raw?.songList ??
      []
    );

    return {
      id: raw?.id ?? raw?.idPlaylist ?? this.playlistId,
      idUser: raw?.idUser ?? raw?.userId ?? 0,
      name: raw?.name ?? raw?.title ?? 'Playlist sin nombre',
      description: raw?.description ?? '',
      creationDate: raw?.creationDate ?? raw?.createdAt ?? new Date().toISOString(),
      visible: raw?.visible ?? true,
      songs: normalizedSongs
    };
  }

  private normalizeSongs(rawSongs: any): SongResponseDto[] {
    if (!Array.isArray(rawSongs)) {
      return [];
    }

    return rawSongs.map((song) => ({
      idSong: song?.idSong ?? song?.id ?? 0,
      idUser: song?.idUser ?? song?.userId ?? 0,
      title: song?.title ?? song?.name ?? 'Canción sin título',
      description: song?.description ?? '',
      coverURL: song?.coverURL ?? song?.cover ?? '',
      fileURL: song?.fileURL ?? song?.url ?? '',
      visibility: song?.visibility ?? 'public',
      uploadDate: song?.uploadDate ?? song?.date ?? new Date().toISOString()
    }));
  }
}
