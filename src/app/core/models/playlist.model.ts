export interface PlaylistRequestDto {
  idUser: number;
  name: string;
  description?: string;
  visible?: boolean;
}

export interface PlaylistResponseDto {
  id: number;
  idUser: number;
  name: string;
  description?: string;
  creationDate: string;
  visible: boolean;
  songs?: SongResponseDto[];
}

export interface AddSongToPlaylistDto {
  idSong: number;
}

export interface SongResponseDto {
  idSong: number;
  idUser: number;
  title: string;
  description?: string;
  coverURL?: string;
  fileURL: string;
  visibility: string;
  uploadDate: string;
}