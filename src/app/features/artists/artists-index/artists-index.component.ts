import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-artists-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artists-index.component.html',
  styleUrls: ['./artists-index.component.css']
})
export class ArtistsIndexComponent {
  featuredArtists = [
    { id: 1, name: 'Artista 01', genre: 'Pop', emoji: '🎤' },
    { id: 2, name: 'Artista 02', genre: 'Rock', emoji: '🎤' },
    { id: 3, name: 'Artista 03', genre: 'Jazz', emoji: '🎤' },
    { id: 4, name: 'Artista 04', genre: 'Indie', emoji: '🎤' },
    { id: 5, name: 'Artista 05', genre: 'Electrónica', emoji: '🎤' }
  ];

  followedArtists = [
    { id: 1, name: 'Artista A', emoji: '🎶' },
    { id: 2, name: 'Artista B', emoji: '🎶' },
    { id: 3, name: 'Artista C', emoji: '🎶' }
  ];
}
