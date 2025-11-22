import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
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
  createSong(userId: number, song: SongRequestDto): Observable<SongResponseDto> {
    const headers = new HttpHeaders().set('iduser', userId.toString());
    return this.http.post<SongResponseDto>(this.apiUrl, song, { headers }).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
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
    const headers = new HttpHeaders().set('iduser', userId.toString());
    const body = {
      idSong: songId,
      content,
      parentComment: idParentComment || null
    };
    return this.http.post<CommentResponseDto>(`${this.commentsApiUrl}`, body, { headers }).pipe(
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
    return this.http.get<Genre[]>(`${environment.apiUrl}/genres`);
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en SongService:', error);
    throw error;
  }
}
