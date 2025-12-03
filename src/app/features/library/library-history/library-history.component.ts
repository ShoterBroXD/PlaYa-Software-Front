import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { Track } from '../../../core/models/player.model';
import { Subscription } from 'rxjs';

interface HistoryItem {
  id: number;
  title: string;
  artist: string;
  year: string;
  image: string;
  audioUrl: string;
  timestamp: number;
}

@Component({
  selector: 'app-library-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-history.component.html',
  styleUrls: ['./library-history.component.css']
})
export class LibraryHistoryComponent implements OnInit, OnDestroy {
  history: HistoryItem[] = [];
  private readonly HISTORY_KEY = 'listening_history';
  private readonly MAX_HISTORY_ITEMS = 50;

  constructor(private playerService: PlayerService) {
    // Monitorear cuando cambia la canción actual
    effect(() => {
      const track = this.playerService.currentTrack();
      if (track) {
        this.addToHistory(track);
      }
    });
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  private addToHistory(track: Track): void {
    const historyItem: HistoryItem = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      year: new Date().getFullYear().toString(),
      image: track.coverImage || '/assets/img/images/img-placeholder.svg',
      audioUrl: track.audioUrl,
      timestamp: Date.now()
    };

    // Remover duplicados (mismo ID)
    this.history = this.history.filter(item => item.id !== track.id);

    // Agregar al inicio
    this.history.unshift(historyItem);

    // Limitar tamaño del historial
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
    }

    this.saveHistory();
  }

  clearHistory(): void {
    if (confirm('¿Estás seguro de que deseas borrar todo tu historial?')) {
      this.history = [];
      this.saveHistory();
    }
  }

  playSong(song: HistoryItem): void {
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      coverImage: song.image,
      audioUrl: song.audioUrl,
      duration: 0,
      isLiked: false,
      likes: 0,
      comments: 0
    };
    this.playerService.playTrack(track);
  }
}
