import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-albums',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class CategoriesAlbumsComponent {
  albums = [
    { title: 'Álbum 01', tracks: 10, image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Álbum 02', tracks: 7, image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Álbum 03', tracks: 12, image: '/assets/img/images/img-placeholder.svg' },
    { title: 'Álbum 04', tracks: 9, image: '/assets/img/images/img-placeholder.svg' }
  ];
}
