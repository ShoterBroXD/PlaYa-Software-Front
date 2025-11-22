export interface Community {
  idCommunity?: number;
  name: string;
  description: string;
  creationDate?: Date;
  members?: UserResponseDto[];
  memberCount?: number;
}

export interface CommunityRequestDto {
  name: string;
  description: string;
}

export interface CommunityResponseDto {
  idCommunity: number;
  name: string;
  description: string;
  creationDate: Date;
  members?: UserResponseDto[];
}

export interface JoinCommunityDto {
  idUser: number;
}

export interface UserResponseDto {
  idUser: number;
  name: string;
  email: string;
  type: string;
  registerDate: Date;
  biography?: string;
  redSocial?: string;
}

export interface Thread {
  idThread?: number;
  idUser: number;
  idCommunity: number;
  title: string;
  content: string;
  creationDate?: Date;
}

export interface ThreadRequestDto {
  idUser: number;
  idCommunity: number;
  title: string;
  content: string;
}

export interface ThreadResponseDto {
  idThread: number;
  idUser: number;
  idCommunity: number;
  title: string;
  content: string;
  creationDate: Date;
}

export interface Comment {
  idComment?: number;
  idUser: number;
  idThread: number;
  content: string;
  creationDate?: Date;
}

export interface CommentRequestDto {
  idUser: number;
  idThread: number;
  content: string;
}

export interface CommentResponseDto {
  idComment: number;
  idUser: number;
  idThread: number;
  content: string;
  creationDate: Date;
  user?: UserResponseDto;
}
