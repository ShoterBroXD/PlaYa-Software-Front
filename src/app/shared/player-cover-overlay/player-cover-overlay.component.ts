import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-player-cover-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-cover-overlay.component.html',
  styleUrls: ['./player-cover-overlay.component.css']
})
export class PlayerCoverOverlayComponent {
  constructor(public playerService: PlayerService) {}

  closeCover() {
    this.playerService.toggleCoverExpanded();
  }
}
