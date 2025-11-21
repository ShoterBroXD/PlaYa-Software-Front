import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';
import { SongResponse, SongService } from '../../../core/services/song.service';

interface LibrarySong {
  id: number;
  title: string;
  artist: string;
  year: string;
  image: string;
  duration: number;
  audioUrl: string;
}

@Component({
  selector: 'app-library-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-main.component.html',
  styleUrls: ['./library-main.component.css'],
})
export class LibraryMainComponent implements OnInit {
  recentlyPlayed: LibrarySong[] = [
    {
      id: 1,
      title: 'Musica 01',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 210,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 2,
      title: 'Musica 02',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 195,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 3,
      title: 'Musica 03',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 225,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 4,
      title: 'Musica 04',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 180,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 5,
      title: 'Musica 05',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 240,
      audioUrl: '/assets/audio/sample.mp3',
    },
  ];

  likedSongs: LibrarySong[] = [
    {
      id: 6,
      title: 'Musica 01',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 200,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 7,
      title: 'Musica 02',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 190,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 8,
      title: 'Musica 03',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 215,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 9,
      title: 'Musica 04',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 205,
      audioUrl: '/assets/audio/sample.mp3',
    },
    {
      id: 10,
      title: 'Musica 05',
      artist: 'Artista',
      year: '2024',
      image: '/assets/img/images/img-placeholder.svg',
      duration: 230,
      audioUrl: '/assets/audio/sample.mp3',
    },
  ];

  mySongs: LibrarySong[] = [];
  loadingMySongs = false;
  mySongsError: string | null = null;
  showArtistSection = false;

  constructor(
    private playerService: PlayerService,
    private songService: SongService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.resolveUserType() === 'ARTIST') {
      this.showArtistSection = true;
      const userId = this.authService.getUserId();
      if (userId) {
        this.loadMySongs(userId);
      }
    }
  }

  private loadMySongs(userId: number) {
    this.loadingMySongs = true;
    this.mySongsError = null;
    this.songService.getSongsByUser(userId).subscribe({
      next: (songs) => {
        this.mySongs = songs.map((song) => this.mapToLibrarySong(song));
        this.loadingMySongs = false;
      },
      error: () => {
        this.mySongsError = 'No pudimos cargar tus canciones. Intenta mas tarde.';
        this.loadingMySongs = false;
      },
    });
  }

  private mapToLibrarySong(song: SongResponse): LibrarySong {
    const uploadYear = song.uploadDate ? new Date(song.uploadDate).getFullYear().toString() : '--';
    return {
      id: song.idSong,
      title: song.title,
      artist: song.artist?.name || 'Tu musica',
      year: uploadYear,
      image: song.coverURL || '/assets/img/images/img-placeholder.svg',
      duration: song.duration ?? 0,
      audioUrl: song.fileURL,
    };
  }

  playSong(song: LibrarySong, list: LibrarySong[]) {
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
      isLiked: false,
    };

    const queue: Track[] = list.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.year,
      duration: s.duration,
      coverImage: s.image,
      audioUrl: s.audioUrl,
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50),
      isLiked: false,
    }));

    const index = list.findIndex((s) => s.id === song.id);
    this.playerService.playTrack(track, queue, index);
  }
}
