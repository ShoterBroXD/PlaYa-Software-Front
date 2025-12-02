import { Component, EventEmitter, Input, Output, OnInit, signal, effect } from '@angular/core';
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
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    constructor(
        private playlistService: PlaylistService,
        private authService: AuthService,
        private router: Router
    ) {
        // create effect in constructor (valid injection context)
        try {
            effect(() => {
                if (this.isOpen && this.isOpen()) {
                    this.loadPlaylists();
                }
            });
        } catch (e) {
            // silent fallback
        }
    }

    ngOnInit() {
        // No-op: effect created in constructor to observe `isOpen` in injection context
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
                // console.error('Error loading playlists:', error);
                this.loading.set(false);
            }
        });
    }

    selectPlaylist(playlist: PlaylistResponseDto) {
        if (this.songIds.length === 0) return;

        this.loading.set(true);
        // Determine playlist id (backend may return different field names)
        const rawPlaylistId: any = (playlist as any).id ?? (playlist as any).idPlaylist ?? (playlist as any).id_playlist;
        const playlistIdNum = Number(rawPlaylistId);
        if (!Number.isFinite(playlistIdNum)) {
            // console.error('Invalid playlist id on selectPlaylist:', playlist);
            this.errorMessage.set('ID de playlist inválido. Refresca e intenta de nuevo.');
            this.loading.set(false);
            return;
        }
        // Normalize and validate IDs before sending to backend
        if (this.songIds.length === 1) {
            const raw = this.songIds[0];
            const idSong = Number(raw);
            if (!Number.isFinite(idSong)) {
                this.errorMessage.set('ID de canción inválido: ' + String(raw));
                this.loading.set(false);
                return;
            }
            // console.log('Adding single song to playlist', { playlistId: playlistIdNum, idSong, playlistObj: playlist });
            this.playlistService.addSongToPlaylist(playlistIdNum, { idSong }).subscribe({
                next: () => {
                    this.handleSuccess();
                },
                error: (error) => {
                    // console.error('Error adding song to playlist:', error);
                    const msg = this.extractErrorMessage(error) || 'Error al añadir canción a la playlist';
                    this.errorMessage.set(msg);
                    this.loading.set(false);
                }
            });
        } else {
            const parsed = this.songIds.map(s => Number(s));
            if (parsed.some(v => !Number.isFinite(v))) {
                this.errorMessage.set('Uno o más IDs de canción inválidos');
                this.loading.set(false);
                return;
            }
            // console.log('Adding multiple songs to playlist', { playlistId: playlistIdNum, songIds: parsed, playlistObj: playlist });
            this.playlistService.addSongsToPlaylist(playlistIdNum, parsed).subscribe({
                next: () => {
                    this.handleSuccess();
                },
                error: (error) => {
                    // console.error('Error adding songs to playlist:', error);
                    const msg = this.extractErrorMessage(error) || 'Error al añadir canciones a la playlist';
                    this.errorMessage.set(msg);
                    this.loading.set(false);
                }
            });
        }
    }

    private handleSuccess() {
        this.loading.set(false);
        this.successMessage.set('Canción(s) añadida(s) exitosamente');
        this.added.emit();
        // cerrar modal tras una pequeña pausa para que el usuario vea el mensaje
        setTimeout(() => {
            this.close();
            this.successMessage.set(null);
        }, 900);
    }

    close() {
        this.isOpen.set(false);
        this.closeModal.emit();
    }

    createNewPlaylist() {
        this.close();
        this.router.navigate(['/playlists/create']);
    }

    private extractErrorMessage(err: any): string | null {
        // 1) JSON body with message
        if (err?.error && typeof err.error === 'object' && err.error?.message) {
            return String(err.error.message);
        }
        // 2) string body (maybe HTML or JSON string)
        if (err?.error && typeof err.error === 'string') {
            try {
                const parsed = JSON.parse(err.error);
                if (parsed?.message) return parsed.message;
            } catch (e) {
                const stripped = err.error.replace(/<[^>]*>/g, '').trim();
                if (stripped.length) return stripped;
            }
            return err.error;
        }
        // 3) message field
        if (err?.message && typeof err.message === 'string') return err.message;
        // 4) status fallback
        if (err?.status) return `Error ${err.status} ${err.statusText ?? ''}`.trim();
        return null;
    }
}
