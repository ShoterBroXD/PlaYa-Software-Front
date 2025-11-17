import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-playlists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.css']
})
export class CategoriesPlaylistsComponent {
  playlists = [
    { title: 'Lista 01', count: 12, image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Lista 02', count: 8, image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Lista 03', count: 20, image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Lista 04', count: 5, image: '/assets/img/images/img-placeholder.svg' }
  ];
}
