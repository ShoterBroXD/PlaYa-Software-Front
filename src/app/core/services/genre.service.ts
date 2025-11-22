import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre } from '../models/genre.model';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/genres`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Géneros musicales predefinidos
  private readonly predefinedGenres: Genre[] = [
    { idGenre: 1, name: 'Pop', description: 'Música pop contemporánea' },
    { idGenre: 2, name: 'Rock', description: 'Rock y sus variantes' },
    { idGenre: 3, name: 'Hip Hop', description: 'Hip hop y rap' },
    { idGenre: 4, name: 'Jazz', description: 'Jazz clásico y moderno' },
    { idGenre: 5, name: 'Electrónica', description: 'Música electrónica y EDM' },
    { idGenre: 6, name: 'Reggaeton', description: 'Reggaeton y música urbana latina' },
    { idGenre: 7, name: 'Salsa', description: 'Salsa y música tropical' },
    { idGenre: 8, name: 'Rock Alternativo', description: 'Rock alternativo e indie' },
    { idGenre: 9, name: 'Metal', description: 'Heavy metal y sus subgéneros' },
    { idGenre: 10, name: 'R&B', description: 'Rhythm and Blues contemporáneo' },
    { idGenre: 11, name: 'Country', description: 'Música country y folk' },
    { idGenre: 12, name: 'Clásica', description: 'Música clásica y orquestal' },
    { idGenre: 13, name: 'Blues', description: 'Blues tradicional y moderno' },
    { idGenre: 14, name: 'Reggae', description: 'Reggae y música jamaiquina' },
    { idGenre: 15, name: 'Cumbia', description: 'Cumbia y música latina tradicional' },
    { idGenre: 16, name: 'Bachata', description: 'Bachata romántica y moderna' },
    { idGenre: 17, name: 'Merengue', description: 'Merengue dominicano' },
    { idGenre: 18, name: 'Folk', description: 'Música folk y acústica' },
    { idGenre: 19, name: 'Soul', description: 'Soul y funk' },
    { idGenre: 20, name: 'Trap', description: 'Trap latino y urbano' }
  ];

  /**
   * Obtiene todos los géneros disponibles
   * Devuelve géneros predefinidos localmente
   */
  getAllGenres(): Observable<Genre[]> {
    return of(this.predefinedGenres);
  }

  /**
   * Obtiene un género por ID
   */
  getGenreById(id: number): Observable<Genre> {
    const genre = this.predefinedGenres.find(g => g.idGenre === id);
    return of(genre!);
  }
}
