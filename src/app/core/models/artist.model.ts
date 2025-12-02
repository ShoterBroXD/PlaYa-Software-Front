export interface Artist {
  idUser: number;
  name: string;
  email: string;
  biography?: string;
  redSocial?: string;
  idgenre?: number;
  genreName?: string;
  registerDate?: string;
  premium?: boolean;
  type?: string;
  favoriteGenres?: string[];
}

export interface ArtistFilter {
  role?: string;
  name?: string;
  idgenre?: number;
}

export interface ArtistPopularity {
  idUser: number;
  name: string;
  artistId: number;
  artistName: string;
  genreName: string;
  playCount: number;
  totalPlays: number;
  popularity: number;
}
