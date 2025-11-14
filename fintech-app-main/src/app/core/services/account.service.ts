import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountResponse, AccountRequest } from '../models/account.model';
import { Page, PageRequest } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts`;

  // Signals para ESTADO COMPARTIDO
  private _accounts = signal<AccountResponse[]>([]);
  accounts = this._accounts.asReadonly();

  // GET - Obtener todas las cuentas
  get(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(this.apiUrl).pipe(
      tap(data => this._accounts.set(data))
    );
  }

  // GET - Obtener cuenta por ID
  getById(id: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.apiUrl}/${id}`);
  }

  
  // GET - Obtener cuenta por número
  getByNumber(accountNumber: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.apiUrl}/number/${accountNumber}`);
  }

  // GET - Obtener balance
  getBalanceByNumber(accountNumber: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.apiUrl}/number/${accountNumber}/balance`);
  }

  // GET - Obtener cuentas activas
  getActive(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.apiUrl}/active`).pipe(
      tap(data => this._accounts.set(data))
    );
  }

  // POST - Crear cuenta
  post(data: AccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.apiUrl, data).pipe(
      tap(newAccount => {
        this._accounts.update(current => [...current, newAccount]);
      })
    );
  }

  // PATCH - Activar cuenta
  patchActivate(id: string): Observable<AccountResponse> {
    return this.http.patch<AccountResponse>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(updatedAccount => {
        this._accounts.update(current =>
          current.map(account => account.id === id ? updatedAccount : account)
        );
      })
    );
  }

  // PATCH - Desactivar cuenta
  patchDeactivate(id: string): Observable<AccountResponse> {
    return this.http.patch<AccountResponse>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      tap(updatedAccount => {
        this._accounts.update(current =>
          current.map(account => account.id === id ? updatedAccount : account)
        );
      })
    );
  }

  // ===== MÉTODOS CON PAGINACIÓN =====

  // GET - Obtener todas las cuentas paginadas
  getPaginated(pageRequest: PageRequest = {}): Observable<Page<AccountResponse>> {
    let params = new HttpParams();
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<AccountResponse>>(`${this.apiUrl}/paginated`, { params });
  }

  // GET - Obtener cuentas activas paginadas
  getActivePaginated(pageRequest: PageRequest = {}): Observable<Page<AccountResponse>> {
    let params = new HttpParams();
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<AccountResponse>>(`${this.apiUrl}/paginated/active`, { params });
  }
}
