import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Song, SongRequest, RateSongRequest } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;

  constructor(private http: HttpClient) {}

  private getHeaders(idUser?: number): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    if (idUser) {
      headers['idUser'] = idUser.toString();
    }
    
    return new HttpHeaders(headers);
  }

  createSong(userId: number, song: SongRequest): Observable<Song> {
    return this.http.post<Song>(this.apiUrl, song, { headers: this.getHeaders(userId) });
  }

  getSongById(id: number): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateSong(id: number, song: Partial<SongRequest>): Observable<Song> {
    return this.http.put<Song>(`${this.apiUrl}/${id}`, song, { headers: this.getHeaders() });
  }

  deleteSong(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  getSongsByUser(userId: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  getPublicSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/public`, { headers: this.getHeaders() });
  }

  getComments(songId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${songId}/comments`, { headers: this.getHeaders() });
  }

  rateSong(songId: number, rating: number): Observable<Song> {
    return this.http.post<Song>(
      `${this.apiUrl}/${songId}/rate`, 
      { rating } as RateSongRequest,
      { headers: this.getHeaders() }
    );
  }

  reportSong(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/report`, {}, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  unreportSong(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/unreport`, {}, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }
}
