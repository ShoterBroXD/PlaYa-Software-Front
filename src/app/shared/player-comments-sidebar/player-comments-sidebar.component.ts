import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../core/services/player.service';
import { Comment } from '../../core/models/player.model';
import { ReportModalComponent } from '../components/report-modal/report-modal.component';

@Component({
  selector: 'app-player-comments-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportModalComponent],
  templateUrl: './player-comments-sidebar.component.html',
  styleUrls: ['./player-comments-sidebar.component.css']
})
export class PlayerCommentsSidebarComponent {
  newComment = signal('');
  sortBy = signal<'recent' | 'popular'>('recent');
  showReportModal = signal(false);
  selectedCommentId = signal<number | null>(null);
  expandedReplies = signal<Set<number>>(new Set());
  openDropdowns = signal<Set<number>>(new Set());
  
  // Mock data - esto debería venir de un servicio
  comments = signal<Comment[]>([
    {
      id: 1,
      userId: 1,
      username: 'Usuario123',
      avatar: '/assets/img/icons/user.png',
      content: '¡Qué gran canción! Me parece que transmite perfectamente el mensaje del cantante.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
      likes: 24,
      isLiked: false,
      replies: [
        {
          id: 11,
          userId: 2,
          username: 'FanMJ2024',
          avatar: '/assets/img/icons/user.png',
          content: 'Verdades más claras jamás dichas.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likes: 5,
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      userId: 3,
      username: 'MusicLover99',
      avatar: '/assets/img/icons/user.png',
      content: 'Una de mis favoritas de todos los tiempos 🎵',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // hace 5 horas
      likes: 56,
      isLiked: true,
      replies: []
    }
  ]);

  constructor(public playerService: PlayerService) {}

  postComment() {
    const content = this.newComment().trim();
    if (!content) return;

    // TODO: Llamar a API para crear comentario
    const newComment: Comment = {
      id: Date.now(),
      userId: 999, // Usuario actual
      username: 'Tú',
      avatar: '/assets/img/icons/user.png',
      content,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    this.comments.update(comments => [newComment, ...comments]);
    this.newComment.set('');
  }

  toggleLike(comment: Comment) {
    // TODO: Llamar a API
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    this.comments.update(c => [...c]); // Trigger update
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
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  }

  openReportModal(commentId: number) {
    this.selectedCommentId.set(commentId);
    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedCommentId.set(null);
  }

  onReportSubmitted() {
    this.closeReportModal();
    // TODO: Mostrar mensaje de éxito
  }

  toggleDropdown(commentId: number) {
    const open = this.openDropdowns();
    if (open.has(commentId)) {
      open.delete(commentId);
    } else {
      open.add(commentId);
    }
    this.openDropdowns.set(new Set(open));
  }

  isDropdownOpen(commentId: number): boolean {
    return this.openDropdowns().has(commentId);
  }
}
