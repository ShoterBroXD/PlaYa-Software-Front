import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { FollowService } from '../../../core/services/follow.service';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { Artist } from '../../../core/models/artist.model';
import { SongResponseDto } from '../../../core/models/song.model';
import { Track } from '../../../core/models/player.model';

@Component({
  selector: 'app-artist-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  artistId: string | null = null;
  artist: Artist | null = null;
  songs: SongResponseDto[] = [];
  followersCount = 0;
  followingCount = 0;
  loading = false;
  isFollowing = false;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    private followService: FollowService,
    private songService: SongService,
    private authService: AuthService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.artistId = this.route.snapshot.paramMap.get('id');
    if (this.artistId) {
      const id = +this.artistId;
      this.loadArtist(id);
      this.loadSongs(id);
      this.loadFollowStats(id);
      this.checkIfFollowing(id);
    }
  }

  loadArtist(id: number) {
    this.loading = true;
    this.artist = {
      idUser: id,
      name: 'Cargando...',
      email: '',
      biography: '',
      genreName: undefined
    };
  }

  loadSongs(userId: number) {
    this.songService.getSongsByUser(userId).subscribe({
      next: (songs) => {
        if (songs && Array.isArray(songs)) {
          this.songs = songs.filter(s => s.visibility === 'public');
          if (songs.length > 0 && this.artist && songs[0].artist) {
            this.artist.name = songs[0].artist.name || 'Artista';
          } else if (this.artist) {
            this.artist.name = 'Artista';
          }
        } else {
          this.songs = [];
          if (this.artist) {
            this.artist.name = 'Artista';
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar canciones:', error);
        if (this.artist) {
          this.artist.name = 'Artista';
        }
        this.songs = [];
        this.loading = false;
      }
    });
  }

  loadFollowStats(artistId: number) {
    this.followService.countFollowers(artistId).subscribe({
      next: (count) => this.followersCount = count,
      error: (error) => console.error('Error al contar seguidores:', error)
    });

    this.followService.countFollowing(artistId).subscribe({
      next: (count) => this.followingCount = count,
      error: (error) => console.error('Error al contar siguiendo:', error)
    });
  }

  checkIfFollowing(artistId: number) {
    if (!this.currentUserId) return;

    this.followService.isFollowing(this.currentUserId, artistId).subscribe({
      next: (following) => this.isFollowing = following,
      error: (error) => console.error('Error al verificar follow:', error)
    });
  }

  toggleFollow() {
    if (!this.currentUserId || !this.artistId) return;

    const artistId = +this.artistId;
    const action = this.isFollowing
      ? this.followService.unfollowArtist(this.currentUserId, artistId)
      : this.followService.followArtist(this.currentUserId, artistId);

    action.subscribe({
      next: (message) => {
        this.isFollowing = !this.isFollowing;
        this.loadFollowStats(artistId);
        console.log(message);
      },
      error: (error) => console.error('Error al cambiar follow:', error)
    });
  }

  playSong(song: SongResponseDto) {
    // Convert SongResponseDto to Track
    const track: Track = {
      id: song.idSong,
      title: song.title,
      artist: song.artist?.name || this.artist?.name || 'Artista Desconocido',
      album: song.genre?.name || 'Sin álbum',
      duration: song.duration || 0,
      coverImage: song.coverURL || '/assets/img/images/img-placeholder.svg',
      audioUrl: song.fileURL || '',
      likes: 0,
      comments: 0,
      isLiked: false
    };

    // Convert all songs to Track queue
    const queue: Track[] = this.songs.map(s => ({
      id: s.idSong,
      title: s.title,
      artist: s.artist?.name || this.artist?.name || 'Artista Desconocido',
      album: s.genre?.name || 'Sin álbum',
      duration: s.duration || 0,
      coverImage: s.coverURL || '/assets/img/images/img-placeholder.svg',
      audioUrl: s.fileURL,
      likes: 0,
      comments: 0,
      isLiked: false
    }));

    const index = this.songs.findIndex(s => s.idSong === song.idSong);
    this.playerService.playTrack(track, queue, index);
  }
}
