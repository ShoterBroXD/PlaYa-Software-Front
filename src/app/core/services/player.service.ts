import { Injectable, signal, computed, effect } from '@angular/core';
import { Track, PlayerState, PlayerUIState, Comment } from '../models/player.model';
import { LikeService } from './like.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  // Estado del reproductor
  private playerState = signal<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    volume: 50,
    isShuffle: false,
    repeatMode: 'none',
    queue: [],
    currentIndex: -1
  });

  // Estado de la UI
  private uiState = signal<PlayerUIState>({
    showCoverExpanded: false,
    showPlaylistSidebar: false,
    showCommentsSidebar: false
  });

  // Audio element (se creará en el servicio para control global)
  private audio: HTMLAudioElement | null = null;

  // Signals públicas de solo lectura
  currentTrack = computed(() => this.playerState().currentTrack);
  isPlaying = computed(() => this.playerState().isPlaying);
  currentTime = computed(() => this.playerState().currentTime);
  volume = computed(() => this.playerState().volume);
  isShuffle = computed(() => this.playerState().isShuffle);
  repeatMode = computed(() => this.playerState().repeatMode);
  queue = computed(() => this.playerState().queue);
  currentIndex = computed(() => this.playerState().currentIndex);

  showCoverExpanded = computed(() => this.uiState().showCoverExpanded);
  showPlaylistSidebar = computed(() => this.uiState().showPlaylistSidebar);
  showCommentsSidebar = computed(() => this.uiState().showCommentsSidebar);

  // Computed para progreso en porcentaje
  progress = computed(() => {
    const track = this.currentTrack();
    const time = this.currentTime();
    if (!track || track.duration === 0) return 0;
    return (time / track.duration) * 100;
  });

  // Computed para saber si hay track cargado
  hasTrack = computed(() => this.currentTrack() !== null);

  constructor(
    private likeService: LikeService,
    private authService: AuthService
  ) {
    // Crear audio element
    this.audio = new Audio();

    // Listeners para actualizar estado
    this.audio.addEventListener('timeupdate', () => {
      this.updateCurrentTime(this.audio!.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      console.log('Track loaded:', this.audio!.duration);
    });
  }


  playTrack(track: Track, queue: Track[] = [], startIndex: number = 0) {
    this.playerState.update(state => ({
      ...state,
      currentTrack: track,
      queue: queue.length > 0 ? queue : [track],
      currentIndex: startIndex,
      isPlaying: true
    }));

    if (this.audio) {
      this.audio.src = track.audioUrl;
      this.audio.volume = this.volume() / 100;
      this.audio.play().catch(err => console.error('Error playing:', err));
    }
  }

  togglePlayPause() {
    const isPlaying = this.isPlaying();

    if (isPlaying) {
      this.audio?.pause();
    } else {
      this.audio?.play().catch(err => console.error('Error playing:', err));
    }

    this.playerState.update(state => ({
      ...state,
      isPlaying: !isPlaying
    }));
  }

  nextTrack() {
    const state = this.playerState();
    const queue = state.queue;
    let nextIndex: number;

    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = state.currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return; // No hay siguiente
        }
      }
    }

    if (queue[nextIndex]) {
      this.playTrack(queue[nextIndex], queue, nextIndex);
    }
  }

  previousTrack() {
    const state = this.playerState();
    const queue = state.queue;

    // Si ya pasaron más de 3 segundos, reiniciar canción actual
    if (state.currentTime > 3) {
      this.seek(0);
      return;
    }

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        return; // No hay anterior
      }
    }

    if (queue[prevIndex]) {
      this.playTrack(queue[prevIndex], queue, prevIndex);
    }
  }

  seek(seconds: number) {
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.updateCurrentTime(seconds);
    }
  }

  seekToPercent(percent: number) {
    const track = this.currentTrack();
    if (track) {
      const seconds = (percent / 100) * track.duration;
      this.seek(seconds);
    }
  }

  setVolume(volume: number) {
    const clampedVolume = Math.max(0, Math.min(100, volume));

    this.playerState.update(state => ({
      ...state,
      volume: clampedVolume
    }));

    if (this.audio) {
      this.audio.volume = clampedVolume / 100;
    }
  }

  toggleShuffle() {
    this.playerState.update(state => ({
      ...state,
      isShuffle: !state.isShuffle
    }));
  }

  toggleRepeat() {
    this.playerState.update(state => {
      const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];

      return {
        ...state,
        repeatMode: nextMode
      };
    });
  }

  private handleTrackEnded() {
    const state = this.playerState();

    if (state.repeatMode === 'one') {
      this.seek(0);
      this.audio?.play();
    } else {
      this.nextTrack();
    }
  }

  private updateCurrentTime(time: number) {
    this.playerState.update(state => ({
      ...state,
      currentTime: time
    }));
  }

  // ==================== CONTROL DE UI ====================

  toggleCoverExpanded() {
    this.uiState.update(state => ({
      ...state,
      showCoverExpanded: !state.showCoverExpanded,
      // Si se cierra el cover, cerrar sidebars también
      showPlaylistSidebar: !state.showCoverExpanded ? false : state.showPlaylistSidebar,
      showCommentsSidebar: !state.showCoverExpanded ? false : state.showCommentsSidebar
    }));
  }

  togglePlaylistSidebar() {
    this.uiState.update(state => {
      const willShow = !state.showPlaylistSidebar;
      return {
        ...state,
        // NO forzar cover, solo abrir/cerrar sidebar
        showPlaylistSidebar: willShow,
        showCommentsSidebar: willShow ? false : state.showCommentsSidebar // Exclusividad
      };
    });
  }

  toggleCommentsSidebar() {
    this.uiState.update(state => {
      const willShow = !state.showCommentsSidebar;
      return {
        ...state,
        // NO forzar cover, solo abrir/cerrar sidebar
        showCommentsSidebar: willShow,
        showPlaylistSidebar: willShow ? false : state.showPlaylistSidebar // Exclusividad
      };
    });
  }

  // ==================== ACCIONES SOCIALES ====================

  toggleLike() {
    const track = this.currentTrack();
    if (!track) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Usuario no autenticado');
      return;
    }

    // Optimistic update
    const updatedTrack = {
      ...track,
      isLiked: !track.isLiked,
      likes: track.isLiked ? track.likes - 1 : track.likes + 1
    };

    this.playerState.update(state => ({
      ...state,
      currentTrack: updatedTrack,
      queue: state.queue.map(t => t.id === track.id ? updatedTrack : t)
    }));

    // Llamar al backend
    this.likeService.toggleLike(track.id, userId, track.isLiked ?? false).subscribe({
      next: (message) => {
        console.log('Like actualizado:', message);
      },
      error: (error) => {
        console.error('Error al actualizar like:', error);
        // Revertir cambio en caso de error
        this.playerState.update(state => ({
          ...state,
          currentTrack: track,
          queue: state.queue.map(t => t.id === track.id ? track : t)
        }));
      }
    });
  }

  addToPlaylist() {
    // TODO: Implementar lógica para agregar a playlist
    console.log('Add to playlist:', this.currentTrack());
  }

  // ==================== GESTIÓN DE COLA ====================

  addToQueue(track: Track) {
    this.playerState.update(state => ({
      ...state,
      queue: [...state.queue, track]
    }));
  }

  removeFromQueue(index: number) {
    this.playerState.update(state => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      let newIndex = state.currentIndex;

      if (index < state.currentIndex) {
        newIndex--;
      } else if (index === state.currentIndex) {
        // Si se elimina la canción actual, pasar a la siguiente
        this.nextTrack();
      }

      return {
        ...state,
        queue: newQueue,
        currentIndex: newIndex
      };
    });
  }

  clearQueue() {
    this.playerState.update(state => ({
      ...state,
      queue: state.currentTrack ? [state.currentTrack] : [],
      currentIndex: 0
    }));
  }
}
