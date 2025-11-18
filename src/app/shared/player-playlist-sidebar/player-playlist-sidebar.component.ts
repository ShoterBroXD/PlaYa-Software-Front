import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../core/services/player.service';
import { Track } from '../../core/models/player.model';

@Component({
  selector: 'app-player-playlist-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-playlist-sidebar.component.html',
  styleUrls: ['./player-playlist-sidebar.component.css']
})
export class PlayerPlaylistSidebarComponent {
  constructor(public playerService: PlayerService) {}

  playTrack(track: Track, index: number) {
    const queue = this.playerService.queue();
    this.playerService.playTrack(track, queue, index);
  }

  isCurrentTrack(track: Track): boolean {
    const current = this.playerService.currentTrack();
    return current?.id === track.id;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
