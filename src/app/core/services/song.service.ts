import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Genre {
  idGenre: number;
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

export interface SongResponse {
  idSong: number;
  title: string;
  coverURL: string;
  fileURL: string;
  visibility: string;
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
      }
    }

    return headers;
  }
}
