import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SongRequestDto,
  SongResponseDto,
  RateSongRequestDto,
  CommentResponseDto
} from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;
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
    return this.http.get<CommentResponseDto[]>(`${this.apiUrl}/${songId}/comments`).pipe(
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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Genre {
  id: number;
  name: string;
}

export interface SongRequestPayload {
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: 'public' | 'private' | 'unlisted';
  idgenre: number;
  duration?: number;
}

export interface SongResponse {
  idSong: number;
  title: string;
  coverURL: string;
  fileURL: string;
  visibility: string;
}

@Injectable({
  providedIn: 'root',
})
export class SongService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getGenres(): Observable<Genre[]> {
    const headers = this.buildHeaders();
    return this.http.get<Genre[]>(`${environment.apiUrl}/genres`, { headers });
  }

  createSong(payload: SongRequestPayload): Observable<SongResponse> {
    const headers = this.buildHeaders(true);
    return this.http.post<SongResponse>(`${environment.apiUrl}/songs`, payload, { headers });
  }

  private buildHeaders(includeUserId = false): HttpHeaders {
    let headers = new HttpHeaders();

    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (includeUserId) {
      const userId = this.authService.getUserId();
      if (userId) {
        headers = headers.set('iduser', userId.toString());
      }
    }

    return headers;
  }
}
