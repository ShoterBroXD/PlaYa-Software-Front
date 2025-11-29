import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';

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
  imports: [CommonModule],
  templateUrl: './listener-dashboard.component.html',
  styleUrls: ['./listener-dashboard.component.css'],
})
export class ListenerDashboardComponent {
  userName = 'Usuario';
  welcomeSubtitle = 'Listo para descubrir nuevos gustos?';
  illustration = '/assets/img/images/sing-girl.png';

  trendingGenres: TrendingGenre[] = [
    { name: 'Genero 01', description: 'Beats electronicos para subir la energia.' },
    { name: 'Genero 02', description: 'Ritmos urbanos para tu dia.' },
    { name: 'Genero 03', description: 'Canciones para relajarte y crear.' },
    { name: 'Genero 04', description: 'Los clasicos que nunca fallan.' },
  ];

  trendingSongs: TrendingSong[] = [
    { name: 'Cancion 01', description: 'Beats electronicos para subir la energia.' },
    { name: 'Cancion 02', description: 'Ritmos urbanos para tu dia.' },
    { name: 'Cancion 03', description: 'Canciones para relajarte y crear.' },
    { name: 'Cancion 04', description: 'Los clasicos que nunca fallan.' },
  ];

  trendingCommunities: TrendingCommunity[] = [
    {
      name: 'Michael Jackson Fans',
      topic: 'Escucharon la nueva mezcla del super bowl?',
      time: 'Hace 1 hora',
      excerpt: 'Jackson vuelve con nuevas mezclas y rarezas de estudio, que opinas?',
    },
    {
      name: 'Artistas tendencia',
      topic: 'Cual es tu artista tendencia global para este verano en PlaYa?',
      time: 'Hace 3 horas',
      excerpt: 'Descubre que artistas lideran la conversacion en la plataforma.',
    },
    {
      name: 'Chris & Friends',
      topic: 'Este artista emergente es muy genial',
      time: 'Hace 6 horas',
      excerpt: 'Conecta y comparte recomendaciones con la comunidad.',
    },
  ];

  // Example songs for the new section (replace with real data as needed)
  songs: (Song & { id?: number; audioUrl?: string; duration?: number })[] = [
    { id: 1, title: 'Road to Sunrise', image: '/assets/img/images/img-placeholder.svg', artist: 'Artist One', year: 2024, audioUrl: '/assets/audio/track1.mp3', duration: 215 },
    { id: 2, title: 'Midnight Groove', image: '/assets/img/images/img-placeholder.svg', artist: 'Artist Two', year: 2023, audioUrl: '/assets/audio/track2.mp3', duration: 189 },
    { id: 3, title: 'Chill Vibes', image: '/assets/img/images/img-placeholder.svg', artist: 'Artist Three', year: 2022, audioUrl: '/assets/audio/track3.mp3', duration: 242 },
    { id: 4, title: 'Golden Hour', image: '/assets/img/images/img-placeholder.svg', artist: 'Artist Four', year: 2021, audioUrl: '/assets/audio/track4.mp3', duration: 198 },
  ];

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
