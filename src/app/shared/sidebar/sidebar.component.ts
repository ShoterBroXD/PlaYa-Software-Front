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

  getIconClass(icon: string): string {
    // Mapeo de nombres de iconos a clases Font Awesome
    const iconMap: { [key: string]: string } = {
      'collection': 'fa-solid fa-folder-open',
      'liked': 'fa-solid fa-heart',
      'following': 'fa-solid fa-user-plus',
      'history': 'fa-solid fa-clock-rotate-left',
      'cog': 'fa-solid fa-gear',
      'logout': 'fa-solid fa-right-from-bracket',
      'grid': 'fa-solid fa-border-all',
      'music': 'fa-solid fa-music',
      'users': 'fa-solid fa-users',
      'search': 'fa-solid fa-magnifying-glass',
      'plus': 'fa-solid fa-plus',
      'list': 'fa-solid fa-list',
      'album': 'fa-solid fa-compact-disc'
    };
    return iconMap[icon] || 'fa-solid fa-circle';
  }
}
