import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { ArtistPopularity } from '../../../core/models/artist.model';

@Component({
  selector: 'app-artists-popular',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './popular.component.html',
  styleUrls: ['./popular.component.css']
})
export class PopularComponent implements OnInit {
  popularArtists: ArtistPopularity[] = [];
  loading = false;

  constructor(private artistService: ArtistService) {}

  ngOnInit() {
    this.loadPopularArtists();
  }

  loadPopularArtists() {
    this.loading = true;
    this.artistService.getArtistPopularity().subscribe({
      next: (artists: ArtistPopularity[]) => {
        // Mapear datos del backend al formato esperado
        this.popularArtists = artists.map(a => ({
          ...a,
          idUser: a.artistId,
          name: a.artistName,
          totalPlays: a.playCount,
          popularity: a.playCount // Calcular popularidad basada en playCount
        })).sort((a, b) => b.playCount - a.playCount);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar artistas populares:', error);
        this.loading = false;
      }
    });
  }

  getPopularityWidth(popularity: number): string {
    return `${popularity}%`;
  }
}
