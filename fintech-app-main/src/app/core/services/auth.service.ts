import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, UserResponse, RoleType } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals para ESTADO COMPARTIDO
  private _currentUser = signal<UserResponse | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _token = signal<string | null>(null);

  currentUser = this._currentUser.asReadonly();
  isAuthenticated = this._isAuthenticated.asReadonly();
  token = this._token.asReadonly();

  constructor() {
    this.loadAuthData();
  }

  // POST - Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthData(response);
      })
    );
  }

  // POST - Register
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.saveAuthData(response);
      })
    );
  }

  // Logout
  logout(): void {
    this.storage.removeItem('token');
    this.storage.removeItem('user');
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  // Helpers privados
  private saveAuthData(response: AuthResponse): void {
    this.storage.setItem('token', response.token);
    this._token.set(response.token);

    // AuthResponse incluye role si viene del backend
    const user: UserResponse = {
      id: '', // No disponible desde AuthResponse
      email: response.email,
      name: response.name,
      role: response.role || RoleType.ROLE_USER, // Usar el role del response o ROLE_USER por defecto
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.storage.setItem('user', user);
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
  }

  private loadAuthData(): void {
    const token = this.storage.getItem<string>('token');
    const user = this.storage.getItem<UserResponse>('user');

    if (token && user) {
      this._token.set(token);
      this._currentUser.set(user);
      this._isAuthenticated.set(true);
    }
  }

  // Getters para guards
  isAdmin(): boolean {
    return this._currentUser()?.role === RoleType.ROLE_ADMIN;
  }

  getToken(): string | null {
    return this._token();
  }

  get currentUserValue(): UserResponse | null {
    return this._currentUser();
  }
}
