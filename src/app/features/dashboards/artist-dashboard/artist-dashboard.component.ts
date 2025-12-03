import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SongService } from '../../../core/services/song.service';
import { SongResponseDto } from '../../../core/models/song.model';

interface HighlightCard {
  title: string;
  description: string;
  action: string;
  icon: string;
  accent: string;
  background: string;
}

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artist-dashboard.component.html',
  styleUrls: ['./artist-dashboard.component.css'],
})
export class ArtistDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private songService = inject(SongService);

  userName = computed(() => this.authService.getCurrentUser()?.name || 'Usuario');
  avatar = '/assets/img/images/profile-pic.jpg';

  uploadedSongs: SongResponseDto[] = [];
  isLoadingSongs = false;
  songsError: string | null = null;

  ngOnInit() {
    this.loadUserSongs();
  }

  loadUserSongs() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.warn('No user ID found');
      return;
    }

    this.isLoadingSongs = true;
    this.songsError = null;

    this.songService.getSongsByUser(userId).subscribe({
      next: (songs) => {
        console.log('Canciones del usuario cargadas:', songs);
        this.uploadedSongs = songs;
        this.isLoadingSongs = false;
      },
      error: (error) => {
        console.error('Error al cargar canciones del usuario:', error);
        this.songsError = 'No se pudieron cargar tus canciones';
        this.isLoadingSongs = false;
      }
    });
  }

  gainsCard: HighlightCard = {
    title: 'Ganancias',
    description:
      'Comienza a hacer dinero en PlaYa! Sube y monetiza para conseguir reproducciones y crecer con tu audiencia.',
    action: 'Comienza aqui',
    icon: '$',
    accent: '#0ea5e9',
    background: '#e0f2fe',
  };

  mostListenedCard: HighlightCard = {
    title: 'Musicas mas escuchadas',
    description:
      'Descubre cuales son las canciones que nunca faltan en las playlists de tus fans.',
    action: 'Ver ranking',
    icon: '♪',
    accent: '#9333ea',
    background: '#f3e8ff',
  };
}
