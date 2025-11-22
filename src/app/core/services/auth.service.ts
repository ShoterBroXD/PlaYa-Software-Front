import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  // Subject para el usuario actual
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Cargar usuario desde localStorage al iniciar
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.logout();
      }
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        this.saveAuthData(response);
      })
    );
  }

  /**
   * Registro de usuario
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap((response) => {
        this.saveAuthData(response);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Opcional: Verificar si el token no ha expirado
    try {
      const payload = this.decodeToken(token);
      const expiry = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < expiry;
    } catch (e) {
      return false;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Decodificar token JWT
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  /**
   * Guardar datos de autenticación
   */
  private saveAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response));

    // Guardar tipo de usuario separado para fácil acceso
    if (response.type) {
      localStorage.setItem('userType', response.type);
    }

    // Extraer y guardar ID de usuario del token JWT
    const payload = this.decodeToken(response.token);
    if (payload && payload.userId) {
      response.idUser = payload.userId;
      localStorage.setItem('userId', payload.userId.toString());
    }

    this.currentUserSubject.next(response);
  }

  // Agregar método para obtener tipo de usuario
  getUserType(): 'ARTIST' | 'LISTENER' | null {
    return localStorage.getItem('userType') as 'ARTIST' | 'LISTENER' | null;
  }

  setUserType(type: 'ARTIST' | 'LISTENER' | null | undefined): void {
    if (!type) {
      return;
    }

    localStorage.setItem('userType', type);
    const current = this.currentUserSubject.value;

    if (current && current.type !== type) {
      this.currentUserSubject.next({ ...current, type });
    }
  }

  resolveUserType(): 'ARTIST' | 'LISTENER' | null {
    const storedType = this.getUserType();
    if (storedType) {
      return storedType;
    }

    const currentType = this.currentUserSubject.value?.type;
    if (currentType === 'ARTIST' || currentType === 'LISTENER') {
      return currentType;
    }

    const storedUserStr = localStorage.getItem('currentUser');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        const type = storedUser?.type;
        if (type === 'ARTIST' || type === 'LISTENER') {
          return type;
        }
      } catch (error) {
        console.error('Error parsing stored currentUser for type', error);
      }
    }

    return null;
  }

  // Agregar método para obtener ID de usuario
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }
}
