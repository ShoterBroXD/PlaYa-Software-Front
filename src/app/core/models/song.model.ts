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

export interface ArtistResponseDto {
  idUser: number;
  name: string;
  biography?: string;
  genre?: {
    idGenre: number;
    name: string;
    description?: string;
  };
}

export interface SongRequestDto {
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: 'public' | 'private' | 'unlisted';
  duration?: number;
  idgenre?: number;
}

export interface RateSongRequest {
  rating: number;
}

export interface SongResponseDto {
  idSong: number;
  idUser: number;
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: string;
  duration?: number;
  uploadDate: Date;
  artist?: ArtistResponseDto;
  genre?: Genre;
  averageRating?: number;
  ratingCount?: number;
}

export interface RateSongRequestDto {
  rating: number;
}

export interface CommentResponseDto {
  idComment: number;
  idUser: number;
  idSong: number;
  content: string;
  date: string;
  parentComment?: number | null;
  user?: {
    idUser: number;
    name: string;
    email: string;
  };
  replies?: CommentResponseDto[];
}
