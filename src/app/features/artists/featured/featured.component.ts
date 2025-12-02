import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth.service';
import { Artist } from '../../../core/models/artist.model';

@Component({
  selector: 'app-artists-featured',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.css']
})
export class FeaturedComponent implements OnInit {
  activeArtists: Artist[] = [];
  needsSupportArtists: Artist[] = [];
  diverseArtists: Artist[] = [];
  loading = false;
  followingArtists = new Set<number>();

  constructor(
    private artistService: ArtistService,
    private followService: FollowService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadFeaturedArtists();
    this.loadFollowingArtists();
  }

  loadFollowingArtists() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.followService.getFollowing(userId).subscribe({
      next: (follows) => {
        this.followingArtists = new Set(follows.map(f => f.artist.idUser));
      },
      error: (error) => console.error('Error al cargar artistas seguidos:', error)
    });
  }

  isFollowing(artistId: number): boolean {
    return this.followingArtists.has(artistId);
  }

  toggleFollow(artist: Artist, event: Event) {
    event.stopPropagation();
    
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    if (this.isFollowing(artist.idUser)) {
      this.followService.unfollowArtist(userId, artist.idUser).subscribe({
        next: () => {
          this.followingArtists.delete(artist.idUser);
        },
        error: (error) => console.error('Error al dejar de seguir:', error)
      });
    } else {
      this.followService.followArtist(userId, artist.idUser).subscribe({
        next: () => {
          this.followingArtists.add(artist.idUser);
        },
        error: (error) => console.error('Error al seguir:', error)
      });
    }
  }

  loadFeaturedArtists() {
    this.loading = true;
    
    // Cargar artistas nuevos (últimos 14 días)
    this.artistService.getNewArtists().subscribe({
      next: (artists) => {
        this.activeArtists = artists;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar artistas nuevos:', error);
        this.loading = false;
      }
    });
  }
}
