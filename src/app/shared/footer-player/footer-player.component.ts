import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-footer-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-player.component.html',
  styleUrls: ['./footer-player.component.css']
})
export class FooterPlayerComponent {
  constructor(public playerService: PlayerService) {}

  // Formatear tiempo
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getFormattedDuration(): string {
    const track = this.playerService.currentTrack();
    return track ? this.formatTime(track.duration) : '0:00';
  }

  onProgressClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    this.playerService.seekToPercent(percent);
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.playerService.setVolume(Number(input.value));
  }

  togglePlayPause() {
    this.playerService.togglePlayPause();
  }

  nextTrack() {
    this.playerService.nextTrack();
  }

  previousTrack() {
    this.playerService.previousTrack();
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  toggleRepeat() {
    this.playerService.toggleRepeat();
  }

  toggleLike() {
    this.playerService.toggleLike();
  }

  toggleComments() {
    this.playerService.toggleCommentsSidebar();
  }

  togglePlaylist() {
    this.playerService.togglePlaylistSidebar();
  }

  toggleCover() {
    this.playerService.toggleCoverExpanded();
  }

  addToPlaylist() {
    this.playerService.addToPlaylist();
  }
}
