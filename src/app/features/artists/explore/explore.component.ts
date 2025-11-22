import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { GenreService } from '../../../core/services/genre.service';
import { Artist } from '../../../core/models/artist.model';
import { Genre } from '../../../core/models/genre.model';

@Component({
  selector: 'app-artists-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  selectedGenre = 0;
  searchName = '';
  loading = false;
  genres: Genre[] = [];
  artists: Artist[] = [];

  constructor(
    private artistService: ArtistService,
    private genreService: GenreService
  ) {}

  ngOnInit() {
    this.loadGenres();
    this.loadArtists();
  }

  loadGenres() {
    this.genreService.getAllGenres().subscribe({
      next: (genres) => {
        const normalizedGenres = genres.map((genre: any) => ({
          idGenre: genre.id ?? genre.idGenre,
          name: genre.name
        })) as Genre[];

        this.genres = [{ idGenre: 0, name: 'Todos' } as Genre, ...normalizedGenres];
      },
      error: (error) => console.error('Error cargando géneros:', error)
    });
  }

  loadArtists() {
    this.loading = true;
    
    const genreId = Number(this.selectedGenre) || 0;
    
    const filter = {
      role: 'ARTIST',
      name: this.searchName || undefined,
      idgenre: (genreId && genreId !== 0) ? genreId : undefined
    };

    this.artistService.filterArtists(filter).subscribe({
      next: (artists) => {
        this.artists = artists;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando artistas:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.loadArtists();
  }

  onGenreChange(event: any) {
    const value = event.target.value;
    this.selectedGenre = value ? Number(value) : 0;
    this.loadArtists();
  }

  getFollowerCount(artist: Artist): string {
    // TODO: Implementar contador real de seguidores desde el backend
    return '0';
  }
}
