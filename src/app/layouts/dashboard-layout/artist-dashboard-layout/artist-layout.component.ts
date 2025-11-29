import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { ARTIST_DASHBOARD_SIDEBAR_CONFIG } from '../../../shared/models/sidebar.model';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-artist-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="artist-layout">
      <app-sidebar [config]="sidebarConfig"></app-sidebar>
      <main class="artist-content"
            [style.margin-left.px]="sidebarState.sidebarWidth()"
            [class.has-player]="playerService.hasTrack()"
            [class.collapsed]="sidebarState.collapsed()">
        <div class="artist-inner" [class.center]="sidebarState.collapsed()">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .artist-layout {
      display: flex;
      min-height: calc(100vh - 60px);
      margin-top: 5px;
    }

    .artist-content {
      flex: 1;
      padding: 2rem;
      background-color: #f9f9f9;
      transition: margin-left 0.3s ease;
      display: block;
    }

    /* Contenedor interno que se centra cuando el sidebar está colapsado */
    .artist-inner {
      width: 100%;
    }

    .artist-inner.center {
      /* max-width: 1100px; ajusta al gusto */
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .artist-content {
        margin-left: 80px !important;
        padding: 1rem;
      }
      .artist-inner.center {
        max-width: 100%;
      }
    }
  `]
})
export class ArtistLayoutComponent {
  sidebarConfig = ARTIST_DASHBOARD_SIDEBAR_CONFIG;

  constructor(
    public sidebarState: SidebarStateService,
    public playerService: PlayerService
  ) {}
}
