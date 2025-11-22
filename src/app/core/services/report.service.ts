import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportRequest {
  contentType: 'SONG' | 'COMMENT' | 'PLAYLIST';
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

export interface ReportDetails {
  reportId: number;
  reporterId: number;
  reporterName: string;
  contentType: string;
  contentId: number;
  reason: string;
  description?: string;
  status: string;
  reportDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface ReportStatistics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  reportsByType: { [key: string]: number };
  reportsByReason: { [key: string]: number };
}

export interface ResolveReportRequest {
  action: 'APPROVE' | 'REJECT';
  reviewNotes?: string;
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

  // Reportar contenido
  reportContent(reportData: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.API_URL}/reports/content`, reportData, { headers: this.getHeaders() });
  }

  // Obtener todos los reportes (Admin)
  getAllReports(): Observable<ReportDetails[]> {
    return this.http.get<ReportDetails[]>(`${this.API_URL}/reports`, { headers: this.getHeaders() });
  }

  // Obtener reportes pendientes (Admin)
  getPendingReports(): Observable<ReportDetails[]> {
    return this.http.get<ReportDetails[]>(`${this.API_URL}/reports/pending`, { headers: this.getHeaders() });
  }

  // Resolver reporte (Admin)
  resolveReport(reportId: number, action: ResolveReportRequest): Observable<any> {
    return this.http.put(`${this.API_URL}/reports/${reportId}/resolve`, action, { headers: this.getHeaders() });
  }

  // Obtener reportes de un usuario (Admin)
  getReportsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/reports/user/${userId}`, { headers: this.getHeaders() });
  }

  // Obtener estadísticas de reportes (Admin)
  getReportStatistics(): Observable<ReportStatistics> {
    return this.http.get<ReportStatistics>(`${this.API_URL}/reports/statistics`, { headers: this.getHeaders() });
  }
}