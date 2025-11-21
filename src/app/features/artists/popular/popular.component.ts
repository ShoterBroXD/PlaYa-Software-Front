import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-artists-popular',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './popular.component.html',
  styleUrls: ['./popular.component.css']
})
export class PopularComponent {
  popularArtists = [
    { id: 1, name: 'Nombre Artista', followers: '1.2M', description: 'Género musical o descripción corta del artista.', emoji: '🎤' },
    { id: 2, name: 'Artista B', followers: '850k', description: 'Género musical o descripción corta del artista.', emoji: '🎤' },
    { id: 3, name: 'Artista C', followers: '420k', description: 'Género musical o descripción corta del artista.', emoji: '🎤' },
    { id: 4, name: 'Artista D', followers: '920k', description: 'Género musical o descripción corta del artista.', emoji: '🎤' },
    { id: 5, name: 'Artista E', followers: '650k', description: 'Género musical o descripción corta del artista.', emoji: '🎤' },
    { id: 6, name: 'Artista F', followers: '1.5M', description: 'Género musical o descripción corta del artista.', emoji: '🎤' }
  ];
}
