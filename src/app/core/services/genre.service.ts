import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre } from '../models/genre.model';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private apiUrl = `${environment.apiUrl}/genres`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getSongsByGenre(genreId: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/${genreId}/songs`, { headers: this.getHeaders() });
  }

  createGenre(name: string): Observable<Genre> {
    return this.http.post<Genre>(this.apiUrl, { name }, { headers: this.getHeaders() });
  }
}
