import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SidebarConfig } from '../models/sidebar.model';
import { AuthService } from '../../core/services/auth.service';
import { SidebarStateService } from '../../core/services/sidebar-state.service';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() config!: SidebarConfig;

  constructor(
    private authService: AuthService,
    private router: Router,
    public sidebarState: SidebarStateService,
    public playerService: PlayerService
  ) {}

  toggleCollapse() {
    this.sidebarState.toggleCollapse();
  }

  isCollapsed() {
    return this.sidebarState.collapsed();
  }

  handleItemClick(route: string, event: Event) {
    if (route === '/logout') {
      event.preventDefault();
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  getIconPath(icon: string): string {
    // Mapeo de nombres de iconos a rutas SVG
    const iconMap: { [key: string]: string } = {
      'collection': '/assets/img/icons/collection.svg',
      'liked': '/assets/img/icons/liked.svg',
      'following': '/assets/img/icons/following.svg',
      'history': '/assets/img/icons/history.svg',
      'cog': '/assets/img/icons/cog.svg',
      'logout': '/assets/img/icons/logout.svg',
      'grid': '/assets/img/icons/icon_all.svg',
      'music': '/assets/img/icons/icon_tracks.svg',
      'users': '/assets/img/icons/icon-users.svg',
      'search': '/assets/img/icons/search.svg',
      'plus': '/assets/img/icons/add-list.svg',
      'list': '/assets/img/icons/icon_list_white.svg',
      'album': '/assets/img/icons/icon_album.svg'
    };
    return iconMap[icon] || '/assets/img/icons/collection.svg';
  }
}
