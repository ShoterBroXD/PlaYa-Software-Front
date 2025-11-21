import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface SocialShareRequestPayload {
  songId: number;
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'telegram';
  message?: string;
  hashtags?: string;
}

export interface SocialShareResponse {
  shareId: number;
  userId: number;
  songId: number;
  songTitle: string;
  platform: string;
  shareUrl: string;
  message?: string;
  sharedAt: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  shareSong(payload: SocialShareRequestPayload): Observable<SocialShareResponse> {
    const headers = this.buildHeaders();
    return this.http.post<SocialShareResponse>(`${environment.apiUrl}/social/share`, payload, {
      headers,
    });
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const userId = this.authService.getUserId();
    if (userId) {
      headers = headers.set('iduser', userId.toString());
    }
    return headers;
  }
}

