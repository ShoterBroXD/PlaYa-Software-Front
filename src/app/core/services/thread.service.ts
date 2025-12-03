import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ThreadRequestDto,
  ThreadResponseDto,
  CommentRequestDto,
  CommentResponseDto
} from '../models/community.model';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private apiUrl = `${environment.apiUrl}/threads`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo hilo en una comunidad
   */
  createThread(thread: ThreadRequestDto): Observable<ThreadResponseDto> {
    console.log('ThreadService.createThread - Datos enviados:', thread);
    console.log('ThreadService.createThread - URL:', this.apiUrl);
    return this.http.post<ThreadResponseDto>(this.apiUrl, thread).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un hilo por ID
   */
  getThreadById(id: number): Observable<ThreadResponseDto> {
    return this.http.get<ThreadResponseDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todos los hilos de una comunidad
   */
  getThreadsByCommunityId(communityId: number): Observable<ThreadResponseDto[]> {
    const url = `${environment.apiUrl}/communities/${communityId}/threads`;
    console.log('ThreadService.getThreadsByCommunityId - URL:', url);
    return this.http.get<ThreadResponseDto[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener comentarios de un hilo
   */
  getCommentsByThreadId(threadId: number): Observable<CommentResponseDto[]> {
    return this.http.get<CommentResponseDto[]>(`${this.apiUrl}/${threadId}/comments`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear un comentario en un hilo
   */
  createComment(comment: CommentRequestDto): Observable<CommentResponseDto> {
    return this.http.post<CommentResponseDto>(`${this.apiUrl}/${comment.idThread}/comments`, comment).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 404) {
        errorMessage = 'Hilo no encontrado';
      } else if (error.status === 400) {
        errorMessage = error.error || 'Datos inválidos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('Error en ThreadService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
