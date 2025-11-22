import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-tracks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class CategoriesTracksComponent {
  tracks = [
    { artist: 'Messi', title: 'Mundial (track)', duration: '1:23', image: '/assets/img/icons/pop.png' },
    { artist: 'Otro-artista', title: 'Otra-pista', duration: '2:34', image: '/assets/img/icons/rap.jpg' },
    { artist: 'Tercer-artista', title: 'Tercera-pista', duration: '3:45', image: '/assets/img/icons/rock.jpeg' }
  ];
}
