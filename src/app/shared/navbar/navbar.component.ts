import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NotificationsComponent],
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
