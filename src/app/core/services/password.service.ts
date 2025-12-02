import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = `${environment.apiUrl}/users/password`;

  constructor(private http: HttpClient) {}

  /**
   * Cambiar contraseña del usuario autenticado
   * Endpoint: PUT /users/password/change
   * Requiere: JWT token en el header (manejado por auth.interceptor)
   */
  changePassword(request: PasswordChangeRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/change`, request, { responseType: 'text' });
  }

  /**
   * Generar token de reset (para recuperación sin login)
   * Endpoint: POST /users/password/request?email=...
   */
  requestResetToken(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/request?email=${email}`, {}, { responseType: 'text' });
  }

  /**
   * Resetear contraseña usando token
   * Endpoint: POST /users/password/reset?token=...
   */
  resetPassword(token: string, newPassword: string, confirmNewPassword: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/reset?token=${token}`,
      { newPassword, confirmNewPassword },
      { responseType: 'text' }
    );
  }
}
