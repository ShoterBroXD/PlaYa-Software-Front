import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerRequest, CustomerResponse } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customer`;

  /**
   * GET /customer/profile
   * Obtiene el perfil del cliente autenticado
   */
  getProfile(): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/profile`);
  }

  /**
   * PUT /customer/profile
   * Actualiza el perfil del cliente autenticado
   */
  updateProfile(data: CustomerRequest): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.apiUrl}/profile`, data);
  }
}
