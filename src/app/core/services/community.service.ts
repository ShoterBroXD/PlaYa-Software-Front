import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Community,
  CommunityRequestDto,
  CommunityResponseDto,
  JoinCommunityDto,
  UserResponseDto
} from '../models/community.model';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = `${environment.apiUrl}/communities`;
  private readonly HTTP_TIMEOUT = 10000; // 10 segundos

  constructor(private http: HttpClient) {
    console.log('CommunityService - API URL:', this.apiUrl);
  }

  /**
   * Obtener todas las comunidades
   */
  getAllCommunities(): Observable<CommunityResponseDto[]> {
    return this.http.get<CommunityResponseDto[]>(this.apiUrl).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener una comunidad por ID
   */
  getCommunityById(id: number): Observable<CommunityResponseDto> {
    const url = `${this.apiUrl}/${id}`;
    console.log('CommunityService.getCommunityById - URL:', url);
    return this.http.get<CommunityResponseDto>(url).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Crear una nueva comunidad
   */
  createCommunity(community: CommunityRequestDto): Observable<CommunityResponseDto> {
    return this.http.post<CommunityResponseDto>(this.apiUrl, community).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Unirse a una comunidad
   */
  joinCommunity(communityId: number, userId: number): Observable<string> {
    const joinDto: JoinCommunityDto = { idUser: userId };
    return this.http.post(`${this.apiUrl}/${communityId}/users`, joinDto, {
      responseType: 'text'
    }).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener miembros de una comunidad
   */
  getCommunityMembers(communityId: number): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/${communityId}/users`).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar una comunidad
   */
  deleteCommunity(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    }).pipe(
      timeout(this.HTTP_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener comunidades del usuario (filtro del lado del cliente por ahora)
   * En el futuro, esto podría ser un endpoint dedicado en el backend
   */
  getUserCommunities(userId: number): Observable<CommunityResponseDto[]> {
    return this.getAllCommunities().pipe(
      map(communities =>
        communities.filter(community =>
          community.members?.some(member => member.idUser === userId)
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener comunidades recomendadas (por ahora retorna todas)
   * En el futuro, esto podría implementarse con un algoritmo de recomendación
   */
  getRecommendedCommunities(): Observable<CommunityResponseDto[]> {
    return this.getAllCommunities().pipe(
      map(communities => communities.slice(0, 6)), // Limitar a 6 recomendaciones
      catchError(this.handleError)
    );
  }

  /**
   * Obtener comunidades para explorar (comunidades a las que el usuario no pertenece)
   */
  getExploreCommunities(userId: number): Observable<CommunityResponseDto[]> {
    return this.getAllCommunities().pipe(
      map(communities =>
        communities.filter(community =>
          !community.members?.some(member => member.idUser === userId)
        )
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse | any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.name === 'TimeoutError') {
      errorMessage = 'Tiempo de espera agotado. El servidor no responde.';
    } else if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Error del lado del servidor
      if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 409) {
        errorMessage = error.error || 'Conflicto en la operación';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('Error en CommunityService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
