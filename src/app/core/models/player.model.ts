export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration: number; // en segundos
  coverImage: string;
  audioUrl: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number; // segundos actuales
  volume: number; // 0-100
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  queue: Track[];
  currentIndex: number;
}

export interface PlayerUIState {
  showCoverExpanded: boolean;
  showPlaylistSidebar: boolean;
  showCommentsSidebar: boolean;
}
