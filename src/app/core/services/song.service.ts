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

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.status === 0) {
      // Error de conexión - backend no disponible
      errorMessage = '⚠️ No se puede conectar al servidor backend en http://localhost:8080\n\nVerifica que:\n1. El servidor Spring Boot esté corriendo\n2. La API esté disponible en /api/v1/songs\n3. No haya problemas de CORS';
      console.warn('⚠️ Backend no disponible - la interfaz usará datos de ejemplo');
    } else if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 404) {
        errorMessage = 'Canción no encontrada';
      } else if (error.status === 400) {
        errorMessage = error.error || 'Datos inválidos';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('Error en SongService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
