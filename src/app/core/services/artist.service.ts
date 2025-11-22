import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Artist, ArtistFilter, ArtistPopularity } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = `${environment.apiUrl}/users`;
  private statsUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn( 'No hay token en localStorage - Usuario no autenticado');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Filtrar artistas por nombre, género o rol
   */
  filterArtists(filter: ArtistFilter): Observable<Artist[]> {
    let params = new HttpParams();
    
    if (filter.role) {
      params = params.set('role', filter.role);
    }
    if (filter.name) {
      params = params.set('name', filter.name);
    }
    if (filter.idgenre) {
      params = params.set('idgenre', filter.idgenre.toString());
    }

    return this.http.get<Artist[]>(`${this.apiUrl}/artists/filter`, {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtener artistas nuevos (últimos 14 días)
   */
  getNewArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/nuevos`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener artistas emergentes (nuevos o con pocos seguidores)
   */
  getEmergingArtists(limit: number = 20): Observable<Artist[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<Artist[]>(`${this.apiUrl}/emerging`, {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtener artistas activos (han subido música recientemente)
   */
  getActiveArtists(days: number = 30, limit: number = 20): Observable<Artist[]> {
    const params = new HttpParams()
      .set('days', days.toString())
      .set('limit', limit.toString());
    
    return this.http.get<Artist[]>(`${this.apiUrl}/active-artists`, {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtener artistas sin reproducciones (necesitan apoyo)
   */
  getArtistsWithoutPlays(limit: number = 10): Observable<Artist[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<Artist[]>(`${this.apiUrl}/needs-support`, {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Alias de getArtistsWithoutPlays
   */
  getArtistsNeedingSupport(limit: number = 10): Observable<Artist[]> {
    return this.getArtistsWithoutPlays(limit);
  }

  /**
   * Descubrir artistas de géneros diversos
   */
  getArtistsByGenreDiversity(userId?: number, limit: number = 20): Observable<Artist[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get<Artist[]>(`${this.apiUrl}/discover-diverse`, {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtener artistas por género
   */
  getArtistsByGenre(genreId: number): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/genre/${genreId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener popularidad de artistas
   */
  getArtistPopularity(genreId?: number, startDate?: string, endDate?: string): Observable<ArtistPopularity[]> {
    let params = new HttpParams();
    
    if (genreId) {
      params = params.set('idGenre', genreId.toString());
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ArtistPopularity[]>(`${this.statsUrl}/artist-popularity`, {
      headers: this.getHeaders(),
      params
    });
  }

  /**
   * Obtener perfil de un artista por ID
   */
  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/artists/${id}`, {
      headers: this.getHeaders()
    });
  }
}
