import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionResponse, TransactionRequest } from '../models/transaction.model';
import { Page, PageRequest } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transactions`;

  // Signals para ESTADO COMPARTIDO
  private _transactions = signal<TransactionResponse[]>([]);
  transactions = this._transactions.asReadonly();

  // GET - Obtener todas las transacciones
  get(): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(this.apiUrl).pipe(
      tap(data => this._transactions.set(data))
    );
  }

  // GET - Obtener transacción por ID
  getById(id: string): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${this.apiUrl}/${id}`);
  }

  // GET - Obtener transacciones por cuenta
  getByAccountNumber(accountNumber: string): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.apiUrl}/account/${accountNumber}`).pipe(
      tap(data => this._transactions.set(data))
    );
  }

   // GET - Obtener transacciones por id cuenta
  getByAccountId(accountNumber: string): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.apiUrl}/account/id/${accountNumber}`).pipe(
      tap(data => this._transactions.set(data))
    );
  }

  // POST - Crear transacción
  post(data: TransactionRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(this.apiUrl, data).pipe(
      tap(newTransaction => {
        this._transactions.update(current => [newTransaction, ...current]);
      })
    );
  }

  // ===== MÉTODOS CON PAGINACIÓN =====

  // GET - Obtener todas las transacciones paginadas
  getPaginated(pageRequest: PageRequest = {}): Observable<Page<TransactionResponse>> {
    let params = new HttpParams();
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/paginated`, { params });
  }

  // GET - Obtener transacciones por número de cuenta paginadas
  getByAccountNumberPaginated(accountNumber: string, pageRequest: PageRequest = {}): Observable<Page<TransactionResponse>> {
    let params = new HttpParams();
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/paginated/account/number/${accountNumber}`, { params });
  }

  // GET - Obtener transacciones por ID de cuenta paginadas
  getByAccountIdPaginated(accountId: string, pageRequest: PageRequest = {}): Observable<Page<TransactionResponse>> {
    let params = new HttpParams();
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/paginated/account/id/${accountId}`, { params });
  }

  // GET - Obtener transacciones por rango de fechas paginadas
  getByDateRangePaginated(startDate: string, endDate: string, pageRequest: PageRequest = {}): Observable<Page<TransactionResponse>> {
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/paginated/date-range`, { params });
  }

  // GET - Obtener transacciones por número de cuenta y rango de fechas paginadas
  getByAccountNumberAndDateRangePaginated(accountNumber: string, startDate: string, endDate: string, pageRequest: PageRequest = {}): Observable<Page<TransactionResponse>> {
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
    if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
    if (pageRequest.sortBy) params = params.set('sortBy', pageRequest.sortBy);
    if (pageRequest.sortDir) params = params.set('sortDir', pageRequest.sortDir);

    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/paginated/account/number/${accountNumber}/date-range`, { params });
  }
}
