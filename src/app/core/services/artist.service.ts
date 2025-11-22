import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {

  private API_URL = environment.apiUrl; // cámbialo a tu ruta real

  constructor(private http: HttpClient) {}

  getRecentArtists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/recent`);
  }
}
