import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories-albums',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class CategoriesAlbumsComponent {
  albums = [
    { title: 'Álbum 01', tracks: 10 },
    { title: 'Álbum 02', tracks: 7 },
    { title: 'Álbum 03', tracks: 12 },
    { title: 'Álbum 04', tracks: 9 }
  ];

  // Gradientes para álbumes en tonos azules
  private readonly albumGradients = [
    'linear-gradient(135deg, #2c3e50 0%, #0a6e99 100%)',
    'linear-gradient(135deg, #1b4f72 0%, #154360 100%)',
    'linear-gradient(135deg, #0a4d68 0%, #05364d 100%)',
    'linear-gradient(135deg, #6ab0de 0%, #1a5276 100%)',
  ];

  getAlbumGradient(index: number): string {
    return this.albumGradients[index % this.albumGradients.length];
  }
}
