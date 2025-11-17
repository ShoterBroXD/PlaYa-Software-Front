import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recommended-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.css']
})
export class RecommendedCommunitiesComponent {
  recommended = [
    { name: 'Michael Jackson', followers: '75B', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', image: '/assets/img/images/perfil-comunidades.png', id: 1 },
    { name: 'The Beatles', followers: '50B', description: 'Comunidad de fans de The Beatles.', image: '/assets/img/images/perfil-comunidades.png', id: 2 },
    { name: 'Queen', followers: '45B', description: 'We are the champions!', image: '/assets/img/images/perfil-comunidades.png', id: 3 },
    { name: 'Led Zeppelin', followers: '40B', description: 'Stairway to heaven.', image: '/assets/img/images/perfil-comunidades.png', id: 4 },
    { name: 'Pink Floyd', followers: '38B', description: 'The Dark Side of the Moon.', image: '/assets/img/images/perfil-comunidades.png', id: 5 },
    { name: 'The Rolling Stones', followers: '35B', description: 'I can\'t get no satisfaction.', image: '/assets/img/images/perfil-comunidades.png', id: 6 },
    { name: 'Nirvana', followers: '30B', description: 'Smells like teen spirit.', image: '/assets/img/images/perfil-comunidades.png', id: 7 },
    { name: 'Metallica', followers: '28B', description: 'Enter Sandman.', image: '/assets/img/images/perfil-comunidades.png', id: 8 }
  ];
}
