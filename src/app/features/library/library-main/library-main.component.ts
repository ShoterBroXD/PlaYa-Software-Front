import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-main.component.html',
  styleUrls: ['./library-main.component.css']
})
export class LibraryMainComponent {
  recentlyPlayed = [
    { title: 'Música 01', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 02', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 03', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 04', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 05', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' }
  ];

  likedSongs = [
    { title: 'Música 01', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 02', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 03', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 04', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 05', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' }
  ];

  playSong(song: any) {
    console.log('Playing:', song.title);
    // TODO: Integrar con servicio de reproducción
  }
}
