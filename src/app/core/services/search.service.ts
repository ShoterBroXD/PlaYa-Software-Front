import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GenreSearchResult {
  id: number;
  name: string;
}

export interface ArtistSearchResult {
  id: number;
  name: string;
  genreName: string;
  followerCount: number;
}

export interface SongSearchResult {
  id: number;
  title: string;
  artistName: string;
  duration: number;
  coverURL: string;
}

export interface PlaylistSearchResult {
  id: number;
  name: string;
  ownerName: string;
  trackCount: number;
}

export interface CommunitySearchResult {
  id: number;
  name: string;
  memberCount: number;
}

export interface SearchResults {
  genres: GenreSearchResult[];
  artists: ArtistSearchResult[];
  songs: SongSearchResult[];
  playlists: PlaylistSearchResult[];
  communities: CommunitySearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResults> {
    return this.http.get<SearchResults>(this.apiUrl, {
      params: { query }
    });
  }
}
