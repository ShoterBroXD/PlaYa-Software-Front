import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsComponent } from '../components/notifications/notifications.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NotificationsComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  query = signal('');

  constructor(private router: Router) {}

  search() {
    const q = this.query();
    if (!q.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
