import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LIBRARY_SIDEBAR_CONFIG } from '../../shared/models/sidebar.model';

@Component({
  selector: 'app-library-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="library-layout">
      <app-sidebar [config]="sidebarConfig"></app-sidebar>
      <main class="library-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .library-layout {
      display: flex;
      min-height: calc(100vh - 60px);
      margin-top: 60px;
    }

    .library-content {
      flex: 1;
      margin-left: 280px;
      padding: 2rem;
      background-color: #f9f9f9;
      transition: margin-left 0.3s ease;
    }

    /* Ajuste cuando sidebar está colapsada */
    :host ::ng-deep .sidebar-main.collapsed ~ .library-content {
      margin-left: 80px;
    }

    @media (max-width: 768px) {
      .library-content {
        margin-left: 80px;
        padding: 1rem;
      }
    }
  `]
})
export class LibraryLayoutComponent {
  sidebarConfig = LIBRARY_SIDEBAR_CONFIG;
}
