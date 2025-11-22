import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth.service';
import { Artist } from '../../../core/models/artist.model';

@Component({
  selector: 'app-artists-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artists-index.component.html',
  styleUrls: ['./artists-index.component.css']
})
export class ArtistsIndexComponent implements OnInit {
  featuredArtists: Artist[] = [];
  followedArtists: Artist[] = [];
  loading = false;

  constructor(
    private artistService: ArtistService,
    private followService: FollowService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadFeaturedArtists();
    this.loadFollowedArtists();
  }

  loadFeaturedArtists() {
    this.loading = true;
    this.artistService.getNewArtists().subscribe({
      next: (artists) => {
        this.featuredArtists = artists.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando artistas destacados:', error);
        this.loading = false;
      }
    });
  }

  loadFollowedArtists() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.followService.getFollowing(userId).subscribe({
      next: (follows) => {
        // Mapear directamente los datos del artista desde el follow response
        this.followedArtists = follows.map(f => ({
          idUser: f.artist.idUser,
          name: f.artist.name,
          email: f.artist.email,
          genreName: undefined,
          followerCount: undefined
        } as Artist));
      },
      error: (error) => console.error('Error cargando artistas seguidos:', error)
    });
  }

  getArtistGenre(artist: Artist): string {
    return artist.genreName || 'Varios';
  }
}
