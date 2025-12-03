import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth.service';
import { FollowResponse } from '../../../core/models/follow.model';

interface ArtistDisplay {
  idUser: number;
  name: string;
  email: string;
  followDate: string;
}

@Component({
  selector: 'app-library-following',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-following.component.html',
  styleUrls: ['./library-following.component.css']
})
export class LibraryFollowingComponent implements OnInit {
  followingArtists: ArtistDisplay[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private followService: FollowService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFollowing();
  }

  loadFollowing(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.followService.getFollowing(userId).subscribe({
      next: (follows: FollowResponse[]) => {
        console.log('Follows received:', follows);

        // Filtrar follows que tengan información del artista
        this.followingArtists = follows
          .filter(follow => follow.artist && follow.artist.idUser)
          .map(follow => ({
            idUser: follow.artist.idUser,
            name: follow.artist.name || 'Artista',
            email: follow.artist.email || '',
            followDate: follow.followDate
          }));

        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando artistas seguidos:', error);

        if (error.status === 404) {
          // No hay follows, no es un error
          this.followingArtists = [];
        } else {
          this.errorMessage = 'Error al cargar los artistas';
        }

        this.loading = false;
      }
    });
  }

  viewArtist(artist: ArtistDisplay): void {
    this.router.navigate(['/artists/profile', artist.idUser]);
  }

  exploreArtists(): void {
    this.router.navigate(['/artists/explore']);
  }

  get hasFollowing(): boolean {
    return this.followingArtists.length > 0;
  }
}
