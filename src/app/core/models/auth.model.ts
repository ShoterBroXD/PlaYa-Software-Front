export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  type: 'ARTIST' | 'LISTENER';
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  type?: 'ARTIST' | 'LISTENER'; // ← Agregar este campo
  idUser?: number; // ← Opcional pero útil
  language?: string;
  historyVisible?: boolean;
}

export interface UserRole {
  ADMIN: 'ADMIN';
  ARTIST: 'ARTIST';
  LISTENER: 'LISTENER';
}
