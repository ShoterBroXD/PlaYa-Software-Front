import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';

@Component({
  selector: 'app-library-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-main.component.html',
  styleUrls: ['./library-main.component.css']
})
export class LibraryMainComponent {
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

  constructor(private playerService: PlayerService) {}

  playSong(song: any, list: any[]) {
    // Convertir a Track con todos los datos necesarios
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.year,
      duration: song.duration,
      coverImage: song.image,
      audioUrl: song.audioUrl,
      likes: Math.floor(Math.random() * 1000), // Mock
      comments: Math.floor(Math.random() * 50), // Mock
      isLiked: false
    };

    // Convertir toda la lista a Track[]
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
