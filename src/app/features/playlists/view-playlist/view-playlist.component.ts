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
    this.loading = true;
    this.playlistService.getPlaylistById(this.playlistId).subscribe({
      next: (data) => {
        this.playlist = data;
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
    this.router.navigate(['/playlists/my']);
  }
}