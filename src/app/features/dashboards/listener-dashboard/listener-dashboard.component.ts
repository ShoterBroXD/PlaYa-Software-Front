import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SongService } from '../../../core/services/song.service';
import { CommunityService } from '../../../core/services/community.service';

interface TrendingGenre {
  name: string;
  description: string;
}

interface TrendingSong {
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

  ngOnInit() {
    this.loadGenres();
    this.loadCommunities();
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
}
