import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-history.component.html',
  styleUrls: ['./library-history.component.css']
})
export class LibraryHistoryComponent {
  history = [
    { title: 'Música 01', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 02', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 03', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 04', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Música 05', artist: 'Artista', year: '2024', image: '/assets/img/images/img-placeholder.svg' }
  ];

  clearHistory() {
    if (confirm('¿Estás seguro de que deseas borrar todo tu historial?')) {
      this.history = [];
    }
  }

  playSong(song: any) {
    console.log('Playing:', song.title);
  }
}
