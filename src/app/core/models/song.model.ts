export interface Song {
  idSong?: number;
  idUser: number;
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: string;
  duration?: number;
  uploadDate?: Date;
  artist?: ArtistResponseDto;
  genre?: Genre;
  averageRating?: number;
  ratingCount?: number;
}

export interface ArtistResponseDto {
  idUser: number;
  name: string;
  biography?: string;
  genre?: Genre;
}

export interface Genre {
  idGenre: number;
  name: string;
  description?: string;
}

export interface SongRequestDto {
  title: string;
  description?: string;
  coverURL: string;
  fileURL: string;
  visibility: string;
  duration?: number;
  idgenre?: number;
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
  date: Date;
  user?: {
    idUser: number;
    name: string;
    email: string;
  };
}
