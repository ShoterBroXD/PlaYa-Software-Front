import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-artist-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  artistId: string | null = null;
  isFollowing = false;

  artist = {
    name: 'Nombre del Artista',
    emoji: '🎤',
    followers: '1.200.000',
    following: '350',
    bio: 'Breve biografía del artista, su trayectoria, logros destacados y curiosidades.',
    genre: 'Pop, Rock',
    yearsActive: '2010 - Presente',
    country: 'Estados Unidos',
    label: 'XYZ Music'
  };

  popularSongs = [
    { id: 1, title: 'Música 01', year: '2023', album: 'Álbum del artista' },
    { id: 2, title: 'Música 02', year: '2022', album: 'Álbum del artista' },
    { id: 3, title: 'Música 03', year: '2021', album: 'Álbum del artista' }
  ];

  suggestedArtists = [
    { id: 1, name: 'Artista Sugerido 01', genre: 'Pop', emoji: '🎤' },
    { id: 2, name: 'Artista Sugerido 02', genre: 'Rock', emoji: '🎤' },
    { id: 3, name: 'Artista Sugerido 03', genre: 'Indie', emoji: '🎤' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.artistId = this.route.snapshot.paramMap.get('id');
    // Aquí podrías cargar los datos del artista desde un servicio
  }

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
  }

  playSong(songId: number) {
    console.log('Reproduciendo canción:', songId);
  }
}
