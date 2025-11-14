// ===== ENUMS =====
export enum RoleType {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN'
}

// ===== REQUESTS =====
export type ProfileRole = 'listener' | 'artist';

export interface LoginRequest {
  email: string;
  password: string;
  role: ProfileRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: ProfileRole;
  phone?: string;
  dni?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  occupation?: string;
}

// ===== RESPONSES =====
export interface AuthResponse {
  token: string;
  type: string;
  email: string;
  name: string;
  role?: RoleType;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
