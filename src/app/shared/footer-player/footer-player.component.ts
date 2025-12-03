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
  showShareModal = false;

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

  shareTrack() {
    this.showShareModal = true;
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  shareOn(platform: string) {
    const track = this.playerService.currentTrack();
    if (!track) return;

    const shareUrl = `${window.location.origin}/song/${track.id}`;
    const text = `Escucha "${track.title}" de ${track.artist} en PlaYa`;

    let url = '';

    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Instagram no tiene share directo, copiar al portapapeles
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('¡Enlace copiado! Pégalo en Instagram.');
        });
        this.closeShareModal();
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      this.closeShareModal();
    }
  }
}
