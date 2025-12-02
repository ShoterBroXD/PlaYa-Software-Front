export type UserType = 'ARTIST' | 'LISTENER';

export interface User {
  idUser: number;
  name: string;
  email: string;
  type: UserType;
  biography?: string;
  premium: boolean;
  redSocial?: string;
  registerDate: string;
  favoriteGenres?: string[];
  language: string;
  historyVisible: boolean;
}

export interface UserUpdateRequest {
  name: string;
  email?: string;
  biography?: string;
  redSocial?: string;
}

export interface UpdateLanguageRequest {
  language: 'Español' | 'Inglés' | 'Português';
}

export interface UpdatePrivacyRequest {
  historyVisible: boolean;
}

export interface UserPreferencesRequest {
  favoriteGenres: string[];
}
