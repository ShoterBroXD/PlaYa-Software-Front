import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../core/services/player.service';
import { Comment } from '../../core/models/player.model';
import { SongService } from '../../core/services/song.service';
import { CommentResponseDto } from '../../core/models/song.model';
import { AuthService } from '../../core/services/auth.service';
import { ReportModalComponent } from '../components/report-modal/report-modal.component';

@Component({
  selector: 'app-player-comments-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportModalComponent],
  templateUrl: './player-comments-sidebar.component.html',
  styleUrls: ['./player-comments-sidebar.component.css']
})
export class PlayerCommentsSidebarComponent {
  newComment = '';
  replyText = '';
  comments = signal<Comment[]>([]);
  expandedReplies = signal<Set<number>>(new Set());
  replyingTo = signal<number | null>(null);
  isLoading = signal(false);
  loadError = signal<string | null>(null);
  submitting = signal(false);
  submittingReply = signal(false);
  openDropdown = signal<number | null>(null);
  showReportModal = signal(false);
  selectedCommentId = signal<number | null>(null);

  private currentSongId: number | null = null;

  constructor(
    public playerService: PlayerService,
    private songService: SongService,
    private authService: AuthService
  ) {
    effect(() => {
      const track = this.playerService.currentTrack();
      const songId = track?.id ?? null;
      if (songId && songId !== this.currentSongId) {
        this.currentSongId = songId;
        this.fetchComments(songId);
      }
      if (!songId) {
        this.currentSongId = null;
        this.comments.set([]);
      }
    });
  }

  private fetchComments(songId: number) {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.songService.getSongComments(songId).subscribe({
      next: (response) => {
        const parsed = response ? this.buildTree(response) : [];
        this.comments.set(parsed);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(err?.message || 'No pudimos cargar los comentarios.');
        this.comments.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private buildTree(dtos: CommentResponseDto[]): Comment[] {
    const byId = new Map<number, Comment>();

    dtos.forEach((dto) => {
      byId.set(dto.idComment, {
        id: dto.idComment,
        userId: dto.idUser,
        username: dto.user?.name || `Usuario ${dto.idUser}`,
        avatar: '/assets/img/icons/user.png',
        content: dto.content,
        timestamp: new Date(dto.date),
        likes: 0,
        isLiked: false,
        parentId: dto.parentComment ?? undefined,
        replies: []
      });
    });

    const roots: Comment[] = [];

    byId.forEach((comment) => {
      if (comment.parentId) {
        const parent = byId.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        } else {
          roots.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    const sortDesc = (a: Comment, b: Comment) => b.timestamp.getTime() - a.timestamp.getTime();
    roots.sort(sortDesc);
    roots.forEach((root) => root.replies?.sort(sortDesc));

    return roots;
  }

  postComment() {
    const content = this.newComment.trim();
    if (!content || !this.currentSongId) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      this.loadError.set('Debes iniciar sesión para comentar.');
      return;
    }

    this.submitting.set(true);
    this.songService.createSongComment(this.currentSongId, content, userId).subscribe({
      next: () => {
        this.newComment = '';
        this.submitting.set(false);
        this.fetchComments(this.currentSongId!);
      },
      error: (err) => {
        this.submitting.set(false);
        this.loadError.set(err?.message || 'No se pudo publicar el comentario.');
      }
    });
  }

  startReply(commentId: number) {
    if (this.replyingTo() === commentId) {
      this.cancelReply();
      return;
    }
    this.replyingTo.set(commentId);
    this.replyText = '';
  }

  cancelReply() {
    this.replyingTo.set(null);
    this.replyText = '';
  }

  submitReply(commentId: number) {
    const content = this.replyText.trim();
    if (!content || !this.currentSongId) {
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.loadError.set('Debes iniciar sesión para responder.');
      return;
    }

    this.submittingReply.set(true);
    this.songService.createSongComment(this.currentSongId, content, userId, commentId).subscribe({
      next: () => {
        this.submittingReply.set(false);
        this.replyText = '';
        this.replyingTo.set(null);
        this.fetchComments(this.currentSongId!);
      },
      error: (err) => {
        this.submittingReply.set(false);
        this.loadError.set(err?.message || 'No se pudo publicar la respuesta.');
      }
    });
  }

  toggleLike(comment: Comment) {
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    this.comments.update((c) => [...c]);
  }

  toggleReplies(commentId: number) {
    const expanded = this.expandedReplies();
    if (expanded.has(commentId)) {
      expanded.delete(commentId);
    } else {
      expanded.add(commentId);
    }
    this.expandedReplies.set(new Set(expanded));
  }

  isRepliesExpanded(commentId: number): boolean {
    return this.expandedReplies().has(commentId);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
  }

  toggleDropdown(commentId: number) {
    if (this.openDropdown() === commentId) {
      this.openDropdown.set(null);
    } else {
      this.openDropdown.set(commentId);
    }
  }

  isDropdownOpen(commentId: number): boolean {
    return this.openDropdown() === commentId;
  }

  openReportModal(commentId: number) {
    this.selectedCommentId.set(commentId);
    this.showReportModal.set(true);
    this.openDropdown.set(null);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedCommentId.set(null);
  }

  onReportSubmitted() {
    this.closeReportModal();
    // Podrías agregar una notificación aquí
  }
}
