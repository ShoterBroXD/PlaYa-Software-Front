import { Genre } from './genre.model';

export interface Song {
  idSong: number;
  idUser: number;
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: 'public' | 'private' | 'unlisted';
  duration: number;
  uploadDate: string;
  artist?: {
    idUser: number;
    name: string;
    biography?: string;
  };
  genre?: Genre;
  averageRating?: number;
  ratingCount?: number;
}

export interface SongRequest {
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: 'public' | 'private' | 'unlisted';
  duration?: number;
  idgenre?: number;
}

export interface RateSongRequest {
  rating: number; // 1-5
}
