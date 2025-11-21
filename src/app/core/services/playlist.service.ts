import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PlaylistRequestDto,
  PlaylistResponseDto,
  AddSongToPlaylistDto,
  SongResponseDto
} from '../models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  createPlaylist(request: PlaylistRequestDto): Observable<PlaylistResponseDto> {
    return this.http.post<PlaylistResponseDto>(`${this.API_URL}/playlists`, request, {
      headers: this.getHeaders(),
    });
  }

  getPlaylistById(id: number): Observable<PlaylistResponseDto> {
    return this.http.get<PlaylistResponseDto>(`${this.API_URL}/playlists/${id}`, {
      headers: this.getHeaders(),
    });
  }

  addSongToPlaylist(playlistId: number, request: AddSongToPlaylistDto): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/playlists/${playlistId}/songs`, request, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json',
    });
  }

  removeSongFromPlaylist(playlistId: number, songId: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/playlists/${playlistId}/songs/${songId}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json',
    });
  }

  getAllPlaylists(): Observable<PlaylistResponseDto[]> {
    return this.http.get<PlaylistResponseDto[]>(`${this.API_URL}/playlists`, {
      headers: this.getHeaders(),
    });
  }

  getPlaylistsByUser(userId: number): Observable<PlaylistResponseDto[]> {
    return this.http.get<PlaylistResponseDto[]>(`${this.API_URL}/playlists/user/${userId}`, {
      headers: this.getHeaders(),
    });
  }

  deletePlaylist(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/playlists/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json',
    });
  }
}