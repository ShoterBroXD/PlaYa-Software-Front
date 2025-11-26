import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';
import { SongResponseDto } from '../../../core/models/song.model';

@Component({
  selector: 'app-library-main',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './library-main.component.html',
  styleUrls: ['./library-main.component.css']
})
export class LibraryMainComponent implements OnInit {
  userSongs: SongResponseDto[] = [];
  loading = false;
  errorMessage = '';

  recentlyPlayed = [
    { id: 1, title: 'Música 01', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 210, audioUrl: '/assets/audio/sample.mp3' },
    { id: 2, title: 'Música 02', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 195, audioUrl: '/assets/audio/sample.mp3' },
    { id: 3, title: 'Música 03', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 225, audioUrl: '/assets/audio/sample.mp3' },
    { id: 4, title: 'Música 04', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 180, audioUrl: '/assets/audio/sample.mp3' },
    { id: 5, title: 'Música 05', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 240, audioUrl: '/assets/audio/sample.mp3' }
  ];

  likedSongs = [
    { id: 6, title: 'Música 01', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 200, audioUrl: '/assets/audio/sample.mp3' },
    { id: 7, title: 'Música 02', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 190, audioUrl: '/assets/audio/sample.mp3' },
    { id: 8, title: 'Música 03', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 215, audioUrl: '/assets/audio/sample.mp3' },
    { id: 9, title: 'Música 04', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 205, audioUrl: '/assets/audio/sample.mp3' },
    { id: 10, title: 'Música 05', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg', duration: 230, audioUrl: '/assets/audio/sample.mp3' }
  ];

  constructor(
    private playerService: PlayerService,
    private songService: SongService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserSongs();
  }

  loadUserSongs() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Usuario no autenticado');
      return;
    }

    this.loading = true;
    this.songService.getSongsByUser(userId).subscribe({
      next: (songs) => {
        this.userSongs = songs;
        this.loading = false;
        console.log('Canciones del usuario cargadas:', songs);
      },
      error: (error) => {
        console.error('Error al cargar canciones del usuario:', error);
        this.errorMessage = 'Error al cargar tus canciones';
        this.loading = false;
      }
    });
  }

  playSong(song: SongResponseDto, list: SongResponseDto[]) {
    console.log('Song data from backend:', song);
    console.log('fileURL:', song.fileURL);

    // Convertir SongResponseDto a Track con URLs de Cloudinary
    const track: Track = {
      id: song.idSong,
      title: song.title,
      artist: song.artist?.name || 'Artista Desconocido',
      album: song.genre?.name || 'Sin álbum',
      duration: song.duration || 0,
      coverImage: song.coverURL || '/assets/img/images/img-placeholder.svg',
      audioUrl: song.fileURL || '', // URL de Cloudinary del audio
      likes: 0,
      comments: 0,
      isLiked: false
    };

    console.log('Reproduciendo canción:', track);

    // Convertir toda la lista a Track[]
    const queue: Track[] = list.map(s => ({
      id: s.idSong,
      title: s.title,
      artist: s.artist?.name || 'Artista Desconocido',
      album: s.genre?.name || 'Sin álbum',
      duration: s.duration || 0,
      coverImage: s.coverURL || '/assets/img/images/img-placeholder.svg',
      audioUrl: s.fileURL,
      likes: 0,
      comments: 0,
      isLiked: false
    }));

    const index = list.findIndex(s => s.idSong === song.idSong);
    this.playerService.playTrack(track, queue, index);
  }

  playSongOld(song: any, list: any[]) {
    // Método para las canciones mock (recentlyPlayed, likedSongs)
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.year,
      duration: song.duration,
      coverImage: song.image,
      audioUrl: song.audioUrl,
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50),
      isLiked: false
    };

    const queue: Track[] = list.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.year,
      duration: s.duration,
      coverImage: s.image,
      audioUrl: s.audioUrl,
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50),
      isLiked: false
    }));

    const index = list.findIndex(s => s.id === song.id);
    this.playerService.playTrack(track, queue, index);
  }
}
