import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Servicio para reportar contenido inadecuado según US-014

export interface ReportRequest {
  contentType: 'SONG' | 'COMMENT';
  contentId: number;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  reportId: number;
  reporterId: number;
  contentType: string;
  contentId: number;
  reason: string;
  description?: string;
  status: string;
  reportDate: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (userId) {
      headers = headers.set('idUser', userId);
    }
    return headers;
  }

  reportContent(reportData: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.API_URL}/reports/content`, reportData, { headers: this.getHeaders() });
  }
}