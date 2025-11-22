import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = `${environment.apiUrl}/songs`;

  constructor(private http: HttpClient) {}

  private getHeaders(idUser: number): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'idUser': idUser.toString()
    });
  }

  likeSong(songId: number, userId: number): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${songId}/like`,
      {},
      { 
        headers: this.getHeaders(userId),
        responseType: 'text' as 'json'
      }
    );
  }

  unlikeSong(songId: number, userId: number): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${songId}/like`,
      { 
        headers: this.getHeaders(userId),
        responseType: 'text' as 'json'
      }
    );
  }

  toggleLike(songId: number, userId: number, isLiked: boolean): Observable<string> {
    return isLiked 
      ? this.unlikeSong(songId, userId)
      : this.likeSong(songId, userId);
  }
}
