import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library-liked',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-liked.component.html',
  styleUrls: ['./library-liked.component.css']
})
export class LibraryLikedComponent {
  likedSongs = [
    { title: 'Música 01', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 02', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 03', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 04', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 05', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 06', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 07', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 08', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 09', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 10', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' }
  ];

  playSong(song: any) {
    console.log('Playing:', song.title);
  }
}
