import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService } from '../../../core/services/song.service';
import { SongResponseDto } from '../../../core/models/song.model';
import { SongRatingComponent } from '../../../shared/components/song-rating/song-rating.component';

@Component({
  selector: 'app-categories-tracks',
  standalone: true,
  imports: [CommonModule, SongRatingComponent],
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class CategoriesTracksComponent implements OnInit {
  songs: SongResponseDto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private songService: SongService) {}

  ngOnInit() {
    this.loadPublicSongs();
  }

  loadPublicSongs() {
    this.isLoading = true;
    this.error = null;

    // TEMPORAL: Usar solo datos de ejemplo mientras el backend no esté disponible
    // Para conectar al backend, descomenta el bloque siguiente y comenta loadMockData()
    
    this.loadMockData();
    
    /*
    this.songService.getPublicSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.isLoading = false;
        console.log('Canciones públicas cargadas:', songs.length);
      },
      error: (error) => {
        console.error('Error cargando canciones:', error);
        
        // Cargar datos de ejemplo si el backend no está disponible
        this.loadMockData();
        this.error = null; // No mostrar error ya que tenemos datos de ejemplo
      }
    });
    */
  }

  loadMockData() {
    // Datos de ejemplo para demostración
    this.songs = [
      {
        idSong: 1,
        idUser: 1,
        title: 'Bohemian Rhapsody',
        description: 'Una obra maestra del rock',
        coverURL: '/assets/img/icons/rock.jpeg',
        fileURL: '/assets/music/sample.mp3',
        visibility: 'public',
        duration: 354,
        uploadDate: new Date('2024-01-15'),
        artist: {
          idUser: 1,
          name: 'Queen',
          biography: 'Banda legendaria de rock'
        },
        averageRating: 4.8,
        ratingCount: 1250
      },
      {
        idSong: 2,
        idUser: 2,
        title: 'Billie Jean',
        description: 'El Rey del Pop en su mejor momento',
        coverURL: '/assets/img/icons/pop.png',
        fileURL: '/assets/music/sample2.mp3',
        visibility: 'public',
        duration: 294,
        uploadDate: new Date('2024-02-20'),
        artist: {
          idUser: 2,
          name: 'Michael Jackson',
          biography: 'El Rey del Pop'
        },
        averageRating: 4.9,
        ratingCount: 2100
      },
      {
        idSong: 3,
        idUser: 3,
        title: 'Lose Yourself',
        description: 'Hip hop de alto nivel',
        coverURL: '/assets/img/icons/rap.jpg',
        fileURL: '/assets/music/sample3.mp3',
        visibility: 'public',
        duration: 326,
        uploadDate: new Date('2024-03-10'),
        artist: {
          idUser: 3,
          name: 'Eminem',
          biography: 'Rap God'
        },
        averageRating: 4.7,
        ratingCount: 980
      }
    ];
    this.isLoading = false;
    console.log('Cargados datos de ejemplo');
  }

  onRatingChanged(songId: number, event: { rating: number; averageRating: number }) {
    console.log(`Canción ${songId} calificada con ${event.rating} estrellas`);
    console.log(`Nuevo promedio: ${event.averageRating}`);
    
    // Actualizar la canción en el array local
    const song = this.songs.find(s => s.idSong === songId);
    if (song) {
      song.averageRating = event.averageRating;
      song.ratingCount = (song.ratingCount || 0) + 1;
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
