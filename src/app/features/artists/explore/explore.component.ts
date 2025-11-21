import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-artists-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  selectedGenre = 'Todos';
  
  genres = ['Todos', 'Pop', 'Rock', 'Jazz', 'Electrónica', 'Indie'];
  
  artists = [
    { id: 1, name: 'Artista Nuevo 01', genre: 'Pop', followers: '850k', emoji: '🎤' },
    { id: 2, name: 'Artista Nuevo 02', genre: 'Rock', followers: '1.1M', emoji: '🎤' },
    { id: 3, name: 'Artista Nuevo 03', genre: 'Jazz', followers: '430k', emoji: '🎤' },
    { id: 4, name: 'Artista Nuevo 04', genre: 'Electrónica', followers: '690k', emoji: '🎤' },
    { id: 5, name: 'Artista Nuevo 05', genre: 'Indie', followers: '520k', emoji: '🎤' }
  ];

  get filteredArtists() {
    if (this.selectedGenre === 'Todos') {
      return this.artists;
    }
    return this.artists.filter(artist => artist.genre === this.selectedGenre);
  }
}
