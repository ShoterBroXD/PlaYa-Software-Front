import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  createPlaylist(request: PlaylistRequestDto): Observable<PlaylistResponseDto> {
    return this.http.post<PlaylistResponseDto>(`${this.API_URL}/playlists`, request);
  }

  getPlaylistById(id: number): Observable<PlaylistResponseDto> {
    return this.http.get<PlaylistResponseDto>(`${this.API_URL}/playlists/${id}`);
  }

  addSongToPlaylist(playlistId: number, request: AddSongToPlaylistDto): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/playlists/${playlistId}/songs`, request, {
      responseType: 'text' as 'json',
    });
  }

  removeSongFromPlaylist(playlistId: number, songId: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/playlists/${playlistId}/songs/${songId}`, {
      responseType: 'text' as 'json',
    });
  }

  getAllPlaylists(): Observable<PlaylistResponseDto[]> {
    return this.http.get<PlaylistResponseDto[]>(`${this.API_URL}/playlists`);
  }

  getPlaylistsByUser(userId: number): Observable<PlaylistResponseDto[]> {
    return this.http.get<PlaylistResponseDto[]>(`${this.API_URL}/playlists/user/${userId}`);
  }

  deletePlaylist(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/playlists/${id}`, {
      responseType: 'text' as 'json',
    });
  }
}