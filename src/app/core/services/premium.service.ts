import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PremiumStatus, SubscriptionRequest, SubscriptionResponse } from '../models/premium.model';

@Injectable({
  providedIn: 'root',
})
export class PremiumService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  subscribe(request: SubscriptionRequest): Observable<SubscriptionResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const headers = this.getHeaders().set('idUser', userId.toString());
    return this.http.post<SubscriptionResponse>(`${this.API_URL}/premium/subscribe`, request, { headers });
  }

  getStatus(userId: number): Observable<PremiumStatus> {
    return this.http.get<PremiumStatus>(`${this.API_URL}/premium/status/${userId}`, { headers: this.getHeaders() });
  }

  cancel(userId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/premium/cancel/${userId}`, {}, { headers: this.getHeaders() });
  }

  renew(userId: number, request: SubscriptionRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/premium/renew/${userId}`, request, { headers: this.getHeaders() });
  }

  getBenefits(): Observable<any> {
    return this.http.get(`${this.API_URL}/premium/benefits`);
  }

  private getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 0;
  }
}
