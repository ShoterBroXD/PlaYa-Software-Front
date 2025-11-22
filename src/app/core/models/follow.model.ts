export interface Follow {
  idFollow: number;
  follower: {
    idUser: number;
    name: string;
    email: string;
  };
  artist: {
    idUser: number;
    name: string;
    email: string;
  };
  followDate: string;
}

export interface FollowResponse {
  idFollow: number;
  follower: {
    idUser: number;
    name: string;
    email: string;
  };
  artist: {
    idUser: number;
    name: string;
    email: string;
  };
  followDate: string;
}
