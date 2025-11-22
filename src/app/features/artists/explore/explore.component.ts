import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArtistService } from "../../../core/services/artist.service"

@Component({
  selector: 'app-artists-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  selectedGenre = 'Todos';
  
  genres = ['Todos', 'Pop', 'Rock', 'Jazz', 'Electrónica', 'Indie'];
  
  artists: any[] = [];       // DATA REAL del backend
  filtered: any[] = [];      // PARA EL FILTRO

  constructor(private artistService: ArtistService) {}

  ngOnInit() {
    this.loadRecentArtists();
  }

  loadRecentArtists() {
    this.artistService.getRecentArtists().subscribe({
      next: (data) => {
        this.artists = data;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error al obtener artistas:', error);
      }
    });
  }

  onGenreChange() {
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedGenre === 'Todos') {
      this.filtered = this.artists;
    } else {
      this.filtered = this.artists.filter(a => a.genre === this.selectedGenre);
    }
  }
}
