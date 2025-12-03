import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SongRequestDto, SongResponseDto, RateSongRequestDto, CommentResponseDto } from '../models/song.model';
import { Genre } from '../models/genre.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;
  private commentsApiUrl = `${environment.apiUrl}/comments`;
  private readonly HTTP_TIMEOUT = 10000; // 10 segundos

  constructor(private http: HttpClient) {
    console.log('SongService - API URL:', this.apiUrl);
  }

  /**
   * Crear una canción (solo artistas)
   */
  createSong(song: SongRequestDto, userId: number): Observable<SongResponseDto> {
    console.log('=== CREATE SONG ===');
    console.log('URL:', this.apiUrl);
    console.log('Song payload:', JSON.stringify(song, null, 2));
    console.log('User ID (header):', userId);

    // const headers = new HttpHeaders().set('iduser', userId.toString());

    return this.http.post<SongResponseDto>(this.apiUrl, song).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError((error) => {
        console.error('Error en createSong:', error);
        console.error('Error response:', error.error);
        return this.handleError(error);
      })
    );
  }  /**
   * Obtener una canción por ID
   */
  getSongById(id: number): Observable<SongResponseDto> {
    return this.http.get<SongResponseDto>(`${this.apiUrl}/${id}`).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar una canción
   */
  updateSong(id: number, song: SongRequestDto): Observable<SongResponseDto> {
    return this.http.put<SongResponseDto>(`${this.apiUrl}/${id}`, song).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar una canción
   */
  deleteSong(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener comentarios de una canción
   */
  getSongComments(songId: number): Observable<CommentResponseDto[]> {
    return this.http.get<CommentResponseDto[]>(`${this.commentsApiUrl}/song/${songId}`).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Crear un comentario en una canción
   */
  createSongComment(songId: number, content: string, userId: number, idParentComment?: number): Observable<CommentResponseDto> {
    // const headers = new HttpHeaders().set('iduser', userId.toString());
    const body = {
      idSong: songId,
      content,
      parentComment: idParentComment || null
    };
    return this.http.post<CommentResponseDto>(`${this.commentsApiUrl}`, body).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener canciones de un usuario
   */
  getSongsByUser(userId: number): Observable<SongResponseDto[]> {
    return this.http.get<SongResponseDto[]>(`${this.apiUrl}/user/${userId}`).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las canciones públicas
   */
  getPublicSongs(): Observable<SongResponseDto[]> {
    return this.http.get<SongResponseDto[]>(`${this.apiUrl}/public`).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Calificar una canción
   */
  rateSong(songId: number, rating: number): Observable<SongResponseDto> {
    const ratingDto: RateSongRequestDto = { rating };
    console.log(`Calificando canción ${songId} con ${rating} estrellas`);
    return this.http.post<SongResponseDto>(`${this.apiUrl}/${songId}/rate`, ratingDto).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener la calificación del usuario actual para una canción
   */
  getUserRating(songId: number): Observable<number | null> {
    return this.http.get<number>(`${this.apiUrl}/${songId}/user-rating`).pipe(
      timeout(this.HTTP_TIMEOUT),
      map(rating => rating), // El backend devuelve Integer directamente
      catchError((error) => {
        // Si el usuario no ha calificado, el backend devuelve 204 No Content
        if (error.status === 204) {
          console.log(`Usuario no ha calificado la canción ${songId}`);
          return new Observable<null>(observer => {
            observer.next(null);
            observer.complete();
          });
        }
        // Para otros errores, también retornar null para no romper la UI
        console.error('Error obteniendo calificación del usuario:', error);
        return new Observable<null>(observer => {
          observer.next(null);
          observer.complete();
        });
      })
    );
  }  /**
   * Reportar una canción (solo admin)
   */
  reportSong(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/report`, {}, { responseType: 'text' }).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Quitar reporte de una canción (solo admin)
   */
  unreportSong(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/unreport`, {}, { responseType: 'text' }).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener géneros musicales
   */
  getGenres(): Observable<Genre[]> {
    return this.http
      .get<Genre[]>(`${environment.apiUrl}/genres`)
      .pipe(map((genres) => genres.map((genre) => this.normalizeGenre(genre))));
  }

  private normalizeGenre(rawGenre: any): Genre {
    const id = rawGenre?.idGenre ?? rawGenre?.idgenre ?? rawGenre?.id;
    const name = rawGenre?.name ?? rawGenre?.genre ?? rawGenre?.nameGenre;
    const description =
      rawGenre?.description ?? rawGenre?.descripcion ?? rawGenre?.descriptionEs ?? null;

    if (typeof id !== 'number' || Number.isNaN(id)) {
      console.warn('Received genre without numeric id:', rawGenre);
    }

    return {
      idGenre: typeof id === 'number' ? id : 0,
      name: typeof name === 'string' && name.trim() ? name : 'Sin nombre',
      description: typeof description === 'string' ? description : undefined,
    };
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en SongService:', error);
    throw error;
  }
}
