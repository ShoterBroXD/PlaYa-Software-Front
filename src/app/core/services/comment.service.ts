import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface CommentResponse {
  idComment: number;
  idUser: number;
  idSong: number;
  content: string;
  parentComment: number | null;
  date: string;
}

export interface CommentRequestPayload {
  idSong: number;
  content: string;
  parentComment?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getCommentsBySong(songId: number): Observable<CommentResponse[]> {
    const headers = this.buildHeaders();
    return this.http.get<CommentResponse[]>(`${environment.apiUrl}/comments/song/${songId}`, {
      headers,
    });
  }

  createComment(payload: CommentRequestPayload): Observable<CommentResponse> {
    const headers = this.buildHeaders(true);
    return this.http.post<CommentResponse>(`${environment.apiUrl}/comments`, payload, { headers });
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
