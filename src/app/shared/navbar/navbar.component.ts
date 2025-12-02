import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, NotificationsComponent, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  query = signal('');

  constructor(private router: Router, private authService: AuthService) {
  }

  search() {
    const q = this.query();
    if (!q.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  goHome() {
    this.router.navigate([this.getHomeRoute()]);
  }

  getHomeRoute(): string {
    const type = this.authService.resolveUserType();

    if (type === 'LISTENER') {
      return '/dashboard-usuario';
    } else if (type === 'ARTIST') {
      return '/dashboard-artista';
    }

    return '/home';
  }
}
