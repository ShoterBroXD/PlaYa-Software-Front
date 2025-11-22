import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TrendingGenre {
  name: string;
  description: string;
}

interface TrendingCommunity {
  name: string;
  topic: string;
  time: string;
  excerpt: string;
}

@Component({
  selector: 'app-listener-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listener-dashboard.component.html',
  styleUrl: './listener-dashboard.component.css',
})
export class ListenerDashboardComponent {
  userName = 'Usuario';
  welcomeSubtitle = 'Listo para descubrir nuevos gustos?';
  illustration = '/assets/img/images/sing-girl.png';

  trendingGenres: TrendingGenre[] = [
    { name: 'Genero 01', description: 'Beats electronicos para subir la energia.' },
    { name: 'Genero 02', description: 'Ritmos urbanos para tu dia.' },
    { name: 'Genero 03', description: 'Canciones para relajarte y crear.' },
    { name: 'Genero 04', description: 'Los clasicos que nunca fallan.' },
  ];

  trendingCommunities: TrendingCommunity[] = [
    {
      name: 'Michael Jackson Fans',
      topic: 'Escucharon la nueva mezcla del super bowl?',
      time: 'Hace 1 hora',
      excerpt: 'Jackson vuelve con nuevas mezclas y rarezas de estudio, que opinas?',
    },
    {
      name: 'Artistas tendencia',
      topic: 'Cual es tu artista tendencia global para este verano en PlaYa?',
      time: 'Hace 3 horas',
      excerpt: 'Descubre que artistas lideran la conversacion en la plataforma.',
    },
    {
      name: 'Chris & Friends',
      topic: 'Este artista emergente es muy genial',
      time: 'Hace 6 horas',
      excerpt: 'Conecta y comparte recomendaciones con la comunidad.',
    },
  ];
}
