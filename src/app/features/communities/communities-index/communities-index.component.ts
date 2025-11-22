import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-communities-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './communities-index.component.html',
  styleUrls: ['./communities-index.component.css']
})
export class CommunitiesIndexComponent {
  activeCommunities = [
    { name: 'Michael Jackson', followers: '75B', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', image: '/assets/img/images/perfil-comunidades.png', id: 1 },
    { name: 'The Beatles', followers: '50B', description: 'Comunidad de fans de The Beatles.', image: '/assets/img/images/perfil-comunidades.png', id: 2 },
    { name: 'Queen', followers: '45B', description: 'We are the champions!', image: '/assets/img/images/perfil-comunidades.png', id: 3 },
    { name: 'Led Zeppelin', followers: '40B', description: 'Stairway to heaven.', image: '/assets/img/images/perfil-comunidades.png', id: 4 },
    { name: 'Pink Floyd', followers: '38B', description: 'The Dark Side of the Moon.', image: '/assets/img/images/perfil-comunidades.png', id: 5 },
    { name: 'The Rolling Stones', followers: '35B', description: 'I can\'t get no satisfaction.', image: '/assets/img/images/perfil-comunidades.png', id: 6 },
    { name: 'Nirvana', followers: '30B', description: 'Smells like teen spirit.', image: '/assets/img/images/perfil-comunidades.png', id: 7 },
    { name: 'Metallica', followers: '28B', description: 'Enter Sandman.', image: '/assets/img/images/perfil-comunidades.png', id: 8 }
  ];

  topCommunities = [
    { name: 'AC/DC', followers: '25B', description: 'Highway to hell.', image: '/assets/img/images/perfil-comunidades.png', id: 9 },
    { name: 'U2', followers: '22B', description: 'With or without you.', image: '/assets/img/images/perfil-comunidades.png', id: 10 },
    { name: 'Guns N\' Roses', followers: '20B', description: 'Welcome to the jungle.', image: '/assets/img/images/perfil-comunidades.png', id: 11 },
    { name: 'Red Hot Chili Peppers', followers: '18B', description: 'Californication.', image: '/assets/img/images/perfil-comunidades.png', id: 12 },
    { name: 'The Doors', followers: '15B', description: 'Light my fire.', image: '/assets/img/images/perfil-comunidades.png', id: 13 },
    { name: 'Radiohead', followers: '14B', description: 'Creep.', image: '/assets/img/images/perfil-comunidades.png', id: 14 },
    { name: 'Pearl Jam', followers: '12B', description: 'Alive.', image: '/assets/img/images/perfil-comunidades.png', id: 15 },
    { name: 'Foo Fighters', followers: '10B', description: 'Everlong.', image: '/assets/img/images/perfil-comunidades.png', id: 16 }
  ];
}
