import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';
import { PlayerService } from '../../../core/services/player.service';
import { ARTIST_DASHBOARD_SIDEBAR_CONFIG } from '../../../shared/models/sidebar.model';

interface SidebarLink {
  label: string;
  icon?: string;
  isSecondary?: boolean;
}

interface UploadedSong {
  title: string;
  plays: number;
  status: 'Publicado' | 'Borrador';
  lastUpdate: string;
}

interface HighlightCard {
  title: string;
  description: string;
  action: string;
  icon: string;
  accent: string;
  background: string;
}

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-dashboard.component.html',
  styleUrls: ['./artist-dashboard.component.css'],
})
export class ArtistDashboardComponent {
  userName = 'Usuario';
  avatar = 'assets/img/images/logo-usuario.svg';

  constructor(
      public sidebarState: SidebarStateService,
      public playerService: PlayerService
    ) {}

  sidebarLinks: SidebarLink[] = [
    { label: 'Perfil principal' },
    { label: 'Eventos' },
    { label: 'Comunidades' },
    { label: 'Estadisticas' },
    { label: 'Configuracion', isSecondary: true },
    { label: 'Cerrar sesion', isSecondary: true },
  ];

  sidebarConfig = ARTIST_DASHBOARD_SIDEBAR_CONFIG;

  uploadedSongs: UploadedSong[] = [];

  gainsCard: HighlightCard = {
    title: 'Ganancias',
    description:
      'Comienza a hacer dinero en PlaYa! Sube y monetiza para conseguir reproducciones y crecer con tu audiencia.',
    action: 'Comienza aqui',
    icon: '$',
    accent: '#0ea5e9',
    background: '#e0f2fe',
  };

  mostListenedCard: HighlightCard = {
    title: 'Musicas mas escuchadas',
    description:
      'Descubre cuales son las canciones que nunca faltan en las playlists de tus fans.',
    action: 'Ver ranking',
    icon: '♪',
    accent: '#9333ea',
    background: '#f3e8ff',
  };
}
