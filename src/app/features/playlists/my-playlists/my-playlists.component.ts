import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlaylistResponseDto } from '../../../core/models/playlist.model';

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

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.idUser) {
      this.errorMessage = 'Usuario no autenticado.';
      return;
    }

    this.loading = true;
    this.playlistService.getPlaylistsByUser(user.idUser).subscribe({
      next: (data) => {
        this.playlists = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando playlists', error);
        this.errorMessage = 'Error al cargar las playlists.';
        this.loading = false;
      },
    });
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
}