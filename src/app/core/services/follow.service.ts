import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FollowResponse } from '../models/follow.model';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = `${environment.apiUrl}/follows`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  followArtist(followerId: number, artistId: number): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${followerId}/follow/${artistId}`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  unfollowArtist(followerId: number, artistId: number): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${followerId}/unfollow/${artistId}`,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  getFollowing(userId: number): Observable<FollowResponse[]> {
    return this.http.get<FollowResponse[]>(
      `${this.apiUrl}/${userId}/following`,
      { headers: this.getHeaders() }
    );
  }

  getFollowers(artistId: number): Observable<FollowResponse[]> {
    return this.http.get<FollowResponse[]>(
      `${this.apiUrl}/${artistId}/followers`,
      { headers: this.getHeaders() }
    );
  }

  countFollowers(artistId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/${artistId}/followers/count`,
      { headers: this.getHeaders() }
    );
  }

  countFollowing(userId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/${userId}/following/count`,
      { headers: this.getHeaders() }
    );
  }

  isFollowing(followerId: number, artistId: number): Observable<boolean> {
    return new Observable(observer => {
      this.getFollowing(followerId).subscribe({
        next: (follows) => {
          const isFollowing = follows.some(f => f.artist && f.artist.idUser === artistId);
          observer.next(isFollowing);
          observer.complete();
        },
        error: (error) => {
          // Si hay error (404, etc.), asumir que no está siguiendo
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
