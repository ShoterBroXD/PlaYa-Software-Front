import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  User,
  UserUpdateRequest,
  UpdateLanguageRequest,
  UpdatePrivacyRequest,
  UserPreferencesRequest
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  /**
   * Obtener información completa de un usuario por ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar perfil del usuario (nombre, email, biografía, redes sociales)
   */
  updateUserProfile(id: number, data: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Actualizar idioma de la interfaz del usuario
   * US-019 Escenario 01: Cambio de idioma
   */
  updateUserLanguage(id: number, language: 'Español' | 'Inglés' | 'Português'): Observable<void> {
    const payload: UpdateLanguageRequest = { language };
    return this.http.put<void>(`${this.apiUrl}/${id}/settings/language`, payload, {
      responseType: 'text' as 'json'
    }).pipe(
      map(() => void 0)
    );
  }

  /**
   * Actualizar visibilidad del historial de reproducción
   * US-019 Escenario 01: Configuración de privacidad
   */
  updateHistoryVisibility(id: number, visible: boolean): Observable<void> {
    const payload: UpdatePrivacyRequest = { historyVisible: visible };
    return this.http.put<void>(`${this.apiUrl}/${id}/settings/privacy`, payload);
  }

  /**
   * Actualizar preferencias musicales (géneros favoritos)
   * Requiere usuario Premium
   */
  updateUserPreferences(id: number, genres: string[]): Observable<void> {
    const payload: UserPreferencesRequest = { favoriteGenres: genres };
    return this.http.put<void>(`${this.apiUrl}/${id}/preferences`, payload);
  }

  /**
   * Reiniciar preferencias musicales
   */
  resetUserPreferences(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/preferences/reset`, {});
  }

  /**
   * Eliminar usuario (solo para administración)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
