import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PlayerService } from '../../core/services/player.service';
import { Track } from '../../core/models/player.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userType: 'ARTIST' | 'LISTENER' | null = null;

  // Ejemplo de canciones para probar el player
  mockTracks: Track[] = [
    {
      id: 1,
      title: 'Billie Jean',
      artist: 'Michael Jackson',
      album: 'Thriller',
      duration: 294, // 4:54
      coverImage: '/assets/img/images/portada.png',
      audioUrl: '/assets/audio/sample.mp3', // Ruta de ejemplo
      likes: 1250,
      comments: 45,
      isLiked: false
    },
    {
      id: 2,
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      duration: 354, // 5:54
      coverImage: '/assets/img/images/portada.png',
      audioUrl: '/assets/audio/sample2.mp3',
      likes: 2340,
      comments: 89,
      isLiked: true
    },
    {
      id: 3,
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      album: 'Led Zeppelin IV',
      duration: 482, // 8:02
      coverImage: '/assets/img/images/portada.png',
      audioUrl: '/assets/audio/sample3.mp3',
      likes: 980,
      comments: 32,
      isLiked: false
    }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    public playerService: PlayerService
  ) {}

  ngOnInit(): void {
    // Obtener datos del usuario actual
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
        this.userType = user.type || null;
      }
    });
  }

  playTrack(track: Track, index: number) {
    this.playerService.playTrack(track, this.mockTracks, index);
  }
}
