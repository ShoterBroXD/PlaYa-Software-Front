import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlaylistResponseDto } from '../../../core/models/playlist.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-to-playlist-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './add-to-playlist-modal.component.html',
    styleUrls: ['./add-to-playlist-modal.component.css']
})
export class AddToPlaylistModalComponent implements OnInit {
    @Input() isOpen = signal(false);
    @Input() songIds: number[] = [];
    @Output() closeModal = new EventEmitter<void>();
    @Output() added = new EventEmitter<void>();

    playlists = signal<PlaylistResponseDto[]>([]);
    loading = signal(false);

    constructor(
        private playlistService: PlaylistService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.isOpen()) {
            this.loadPlaylists();
        }
    }

    loadPlaylists() {
        const userId = this.authService.getUserId();
        if (!userId) return;

        this.loading.set(true);
        this.playlistService.getPlaylistsByUser(userId).subscribe({
            next: (data) => {
                this.playlists.set(data || []);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading playlists:', error);
                this.loading.set(false);
            }
        });
    }

    selectPlaylist(playlist: PlaylistResponseDto) {
        if (this.songIds.length === 0) return;

        this.loading.set(true);

        if (this.songIds.length === 1) {
            this.playlistService.addSongToPlaylist(playlist.id, { idSong: this.songIds[0] }).subscribe({
                next: () => {
                    this.handleSuccess();
                },
                error: (error) => {
                    console.error('Error adding song to playlist:', error);
                    alert('Error al añadir canción a la playlist');
                    this.loading.set(false);
                }
            });
        } else {
            this.playlistService.addSongsToPlaylist(playlist.id, this.songIds).subscribe({
                next: () => {
                    this.handleSuccess();
                },
                error: (error) => {
                    console.error('Error adding songs to playlist:', error);
                    alert('Error al añadir canciones a la playlist');
                    this.loading.set(false);
                }
            });
        }
    }

    private handleSuccess() {
        this.loading.set(false);
        this.added.emit();
        this.close();
        // Opcional: Mostrar toast de éxito
        alert('Canciones añadidas exitosamente');
    }

    close() {
        this.isOpen.set(false);
        this.closeModal.emit();
    }

    createNewPlaylist() {
        this.close();
        this.router.navigate(['/playlists/create']);
    }
}
