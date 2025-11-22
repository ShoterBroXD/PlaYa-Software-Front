import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Genre {
  id: number;
  name: string;
}

export interface SongRequestPayload {
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: 'public' | 'private' | 'unlisted';
  idgenre: number;
  duration?: number;
}

export interface ArtistSummary {
  idUser: number;
  name: string | null;
  biography: string | null;
  genre: any;
}

export interface SongResponse {
  idSong: number;
  idUser?: number;
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: string;
  duration?: number;
  uploadDate?: string;
  artist?: ArtistSummary | null;
  genre?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SongService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getGenres(): Observable<Genre[]> {
    const headers = this.buildHeaders();
    return this.http.get<Genre[]>(`${environment.apiUrl}/genres`, { headers });
  }

  getSongsByUser(userId: number): Observable<SongResponse[]> {
    const headers = this.buildHeaders();
    return this.http.get<SongResponse[]>(`${environment.apiUrl}/songs/user/${userId}`, {
      headers,
    });
  }

  createSong(payload: SongRequestPayload): Observable<SongResponse> {
    const headers = this.buildHeaders(true);
    return this.http.post<SongResponse>(`${environment.apiUrl}/songs`, payload, { headers });
  }

  private buildHeaders(includeUserId = false): HttpHeaders {
    let headers = new HttpHeaders();

    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (includeUserId) {
      const userId = this.authService.getUserId();
      if (userId) {
        headers = headers.set('iduser', userId.toString());
        headers = headers.set('idUser', userId.toString());
      }
    }

    return headers;
  }
}
