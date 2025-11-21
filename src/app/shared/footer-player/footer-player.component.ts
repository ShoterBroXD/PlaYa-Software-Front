import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../core/services/player.service';
import { SocialService, SocialShareResponse } from '../../core/services/social.service';

@Component({
  selector: 'app-footer-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-player.component.html',
  styleUrls: ['./footer-player.component.css']
})
export class FooterPlayerComponent {
  shareMenuOpen = signal(false);
  shareLoading = signal(false);
  shareError = signal<string | null>(null);
  socialOptions = [
    { id: 'facebook', label: 'Facebook', icon: 'fab fa-facebook-f' },
    { id: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp' },
    { id: 'telegram', label: 'Telegram', icon: 'fab fa-telegram-plane' },
    { id: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },
  ];

  constructor(public playerService: PlayerService, private socialService: SocialService) {}

  @HostListener('document:click')
  closeShareMenu() {
    if (this.shareMenuOpen()) {
      this.shareMenuOpen.set(false);
    }
  }

  toggleShareMenu(event: Event) {
    event.stopPropagation();
    this.shareError.set(null);
    this.shareMenuOpen.set(!this.shareMenuOpen());
  }

  shareSong(event: Event, platform: string) {
    event.stopPropagation();
    const track = this.playerService.currentTrack();
    if (!track) {
      return;
    }

    this.shareLoading.set(true);
    this.shareError.set(null);

    const defaultMessage = `Escucha "${track.title}" en PlaYa!`;

    this.socialService
      .shareSong({
        songId: track.id,
        platform: platform as any,
        message: defaultMessage,
      })
      .subscribe({
        next: (response: SocialShareResponse) => {
          this.shareLoading.set(false);
          this.shareMenuOpen.set(false);
          if (response?.shareUrl) {
            window.open(response.shareUrl, '_blank');
          }
        },
        error: (err) => {
          this.shareLoading.set(false);
          this.shareError.set(err?.message || 'No se pudo compartir la cancion.');
        },
      });
  }

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
