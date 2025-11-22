import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { PlaylistResponseDto } from '../../../core/models/playlist.model';

@Component({
  selector: 'app-categories-playlists',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.css']
})
export class CategoriesPlaylistsComponent implements OnInit {
  playlists: PlaylistResponseDto[] = [];
  loading = false;
  errorMessage = '';

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.loading = true;
    this.playlistService.getAllPlaylists().subscribe({
      next: (data) => {
        this.playlists = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando playlists públicas', error);
        this.errorMessage = 'Error al cargar las playlists.';
        this.loading = false;
      },
    });
  }
}
