import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterPlayerComponent } from '../shared/footer-player/footer-player.component';
import { PlayerCoverOverlayComponent } from '../shared/player-cover-overlay/player-cover-overlay.component';
import { PlayerPlaylistSidebarComponent } from '../shared/player-playlist-sidebar/player-playlist-sidebar.component';
import { PlayerCommentsSidebarComponent } from '../shared/player-comments-sidebar/player-comments-sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    FooterPlayerComponent,
    PlayerCoverOverlayComponent,
    PlayerPlaylistSidebarComponent,
    PlayerCommentsSidebarComponent
  ],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    
    <!-- Player global components -->
    <app-player-cover-overlay />
    <app-player-playlist-sidebar />
    <app-player-comments-sidebar />
    <app-footer-player />
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 60px - 65px);
      margin-top: 0px;
      padding-bottom: 65px;
      padding-top: 60px;
    }
  `]
})
export class MainLayoutComponent {}
