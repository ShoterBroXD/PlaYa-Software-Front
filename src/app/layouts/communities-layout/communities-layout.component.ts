import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { COMMUNITIES_SIDEBAR_CONFIG } from '../../shared/models/sidebar.model';
import { SidebarStateService } from '../../core/services/sidebar-state.service';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-communities-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="communities-layout">
      <app-sidebar [config]="sidebarConfig"></app-sidebar>
      <main class="communities-content" 
            [style.margin-left.px]="sidebarState.sidebarWidth()"
            [class.has-player]="playerService.hasTrack()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .communities-layout {
      display: flex;
      min-height: calc(100vh - 60px);
      margin-top: 5px;
    }

    .communities-content {
      flex: 1;
      padding: 2rem;
      background-color: #f9f9f9;
      transition: margin-left 0.3s ease;
    }

    @media (max-width: 768px) {
      .communities-content {
        margin-left: 80px !important;
        padding: 1rem;
      }
    }
  `]
})
export class CommunitiesLayoutComponent {
  sidebarConfig = COMMUNITIES_SIDEBAR_CONFIG;

  constructor(
    public sidebarState: SidebarStateService,
    public playerService: PlayerService
  ) {}
}
