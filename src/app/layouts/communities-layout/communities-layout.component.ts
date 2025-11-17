import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { COMMUNITIES_SIDEBAR_CONFIG } from '../../shared/models/sidebar.model';

@Component({
  selector: 'app-communities-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="communities-layout">
      <app-sidebar [config]="sidebarConfig"></app-sidebar>
      <main class="communities-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .communities-layout {
      display: flex;
      min-height: calc(100vh - 60px);
      margin-top: 60px;
    }

    .communities-content {
      flex: 1;
      margin-left: 280px;
      padding: 2rem;
      background-color: #f9f9f9;
      transition: margin-left 0.3s ease;
    }

    :host ::ng-deep .sidebar-main.collapsed ~ .communities-content {
      margin-left: 80px;
    }

    @media (max-width: 768px) {
      .communities-content {
        margin-left: 80px;
        padding: 1rem;
      }
    }
  `]
})
export class CommunitiesLayoutComponent {
  sidebarConfig = COMMUNITIES_SIDEBAR_CONFIG;
}
