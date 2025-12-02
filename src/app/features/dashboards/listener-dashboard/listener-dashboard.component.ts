import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SongService } from '../../../core/services/song.service';
import { CommunityService } from '../../../core/services/community.service';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';

interface TrendingGenre {
  name: string;
  description: string;
}

interface TrendingCommunity {
  name: string;
  topic: string;
  time: string;
  excerpt: string;
}

interface Song {
  title: string;
  image: string;
  artist: string;
  year?: string | number;
}

@Component({
  selector: 'app-listener-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listener-dashboard.component.html',
  styleUrls: ['./listener-dashboard.component.css'],
})
export class ListenerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private songService = inject(SongService);
  private communityService = inject(CommunityService);
  private router = inject(Router);

  userName = computed(() => this.authService.getCurrentUser()?.name || 'Usuario');
  welcomeSubtitle = 'Listo para descubrir nuevos gustos?';
  illustration = '/assets/img/images/sing-girl.png';

  trendingGenres: any[] = [];
  trendingCommunities: any[] = [];
  songs: (Song & { id?: number; audioUrl?: string; duration?: number })[] = [];

  ngOnInit() {
    this.loadGenres();
    this.loadCommunities();
    this.loadSongs();
  }

  loadSongs() {
    this.songService.getPublicSongs().subscribe({
      next: (list) => {
        // Map SongResponseDto to local Song shape expected by template and player
        this.songs = list.map(s => ({
          id: s.idSong,
          title: s.title,
          image: s.coverURL || '/assets/img/images/img-placeholder.svg',
          artist: s.artist?.name || 'Artista Desconocido',
          year: s.uploadDate ? new Date(s.uploadDate).getFullYear() : undefined,
          audioUrl: s.fileURL,
          duration: s.duration
        }));
      },
      error: (err) => {
        console.error('Error loading public songs', err);
      }
    });
  }

  loadGenres() {
    this.songService.getGenres().subscribe({
      next: (genres) => {
        // Tomar solo los primeros 4 para mostrar en el dashboard
        this.trendingGenres = genres.slice(0, 4);
      },
      error: (err) => console.error('Error loading genres', err)
    });
  }

  loadCommunities() {
    this.communityService.getRecommendedCommunities().subscribe({
      next: (communities) => {
        // Mapear la respuesta al formato de la vista si es necesario
        this.trendingCommunities = communities.map(c => ({
          name: c.name,
          topic: c.description, // Usamos descripcion como topic
          time: 'Reciente', // Placeholder
          excerpt: c.description,
          id: c.idCommunity
        })).slice(0, 3);
      },
      error: (err) => console.error('Error loading communities', err)
    });
  }

  navigateToGenre(genreId: number) {
    this.router.navigate(['/categories/tracks', genreId]);
  }

  navigateToCommunity(communityId: number) {
    this.router.navigate(['/communities', communityId]);
  }
  constructor(public playerService: PlayerService) {}

  playSong(song: Song & { id?: number; audioUrl?: string; duration?: number }, list: (Song & { id?: number; audioUrl?: string; duration?: number })[]) {
    // Map local Song shape to Track model expected by PlayerService
    const queue: Track[] = list.map((s, i) => ({
      id: s.id ?? i,
      title: s.title,
      artist: s.artist,
      album: undefined,
      duration: s.duration ?? 180,
      coverImage: s.image,
      audioUrl: s.audioUrl ?? '',
      likes: 0,
      comments: 0
    }));

    const index = queue.findIndex(t => t.id === (song.id ?? song.title));
    const startIndex = index >= 0 ? index : 0;

    // If there's no audioUrl for the selected track, warn and abort
    if (!queue[startIndex].audioUrl) {
      console.warn('Selected track has no audioUrl, cannot play:', queue[startIndex]);
      return;
    }

    this.playerService.playTrack(queue[startIndex], queue, startIndex);
  }
}
