import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationCategory } from '../../../core/models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  // Signals
  isOpen = signal<boolean>(false);
  filterUnread = signal<boolean>(false);
  
  // Computed
  filteredNotifications = computed(() => {
    const notifications = this.notificationService.notifications();
    return this.filterUnread() 
      ? notifications.filter(n => !n.read)
      : notifications;
  });

  private pollingSubscription?: Subscription;

  constructor(public notificationService: NotificationService) {}
  
  // Accessors para signals del servicio
  get notifications() { return this.notificationService.notifications; }
  get unreadCount() { return this.notificationService.unreadCount; }
  get loading() { return this.notificationService.loading; }

  ngOnInit(): void {
    // Cargar notificaciones iniciales
    this.loadNotifications();
    
    // Iniciar polling cada 30 segundos
    this.startPolling();
  }

  ngOnDestroy(): void {
    // Detener polling al destruir el componente
    this.pollingSubscription?.unsubscribe();
  }

  /**
   * Toggle del panel de notificaciones
   */
  togglePanel(): void {
    this.isOpen.update(value => !value);
  }

  /**
   * Cerrar panel
   */
  closePanel(): void {
    this.isOpen.set(false);
  }

  /**
   * Cargar notificaciones
   */
  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe({
      error: (err) => console.error('Error al cargar notificaciones:', err)
    });
  }

  /**
   * Iniciar polling para actualización automática
   */
  startPolling(): void {
    this.pollingSubscription = this.notificationService
      .startPolling(30000) // Cada 30 segundos
      .subscribe({
        error: (err) => console.error('Error en polling:', err)
      });
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.idNotification).subscribe({
        error: (err) => console.error('Error al marcar como leída:', err)
      });
    }
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => console.log('Todas las notificaciones marcadas como leídas'),
      error: (err) => console.error('Error al marcar todas como leídas:', err)
    });
  }

  /**
   * Eliminar notificación
   */
  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('¿Eliminar esta notificación?')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => console.log('Notificación eliminada'),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  /**
   * Toggle filtro de no leídas
   */
  toggleFilter(): void {
    this.filterUnread.update(value => !value);
  }

  /**
   * Obtener ícono según tipo de notificación
   */
  getNotificationIcon(type: NotificationCategory): string {
    const icons = {
      [NotificationCategory.FOLLOWER]: 'fas fa-user-plus',
      [NotificationCategory.COMMENT]: 'fas fa-comment',
      [NotificationCategory.NEW_RELEASE]: 'fas fa-music',
      [NotificationCategory.SYSTEM]: 'fas fa-bell'
    };
    return icons[type] || 'fas fa-bell';
  }

  /**
   * Formatear fecha relativa
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    if (diffWeeks < 4) return `Hace ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;
    return `Hace ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
  }

  /**
   * Agrupar notificaciones por fecha
   */
  groupNotificationsByDate(): { title: string; notifications: Notification[] }[] {
    const notifications = this.filteredNotifications();
    const now = new Date();
    
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach(notification => {
      const notifDate = new Date(notification.date);
      const diffDays = Math.floor((now.getTime() - notifDate.getTime()) / 86400000);

      if (diffDays === 0) today.push(notification);
      else if (diffDays === 1) yesterday.push(notification);
      else if (diffDays < 7) thisWeek.push(notification);
      else older.push(notification);
    });

    const groups = [];
    if (today.length > 0) groups.push({ title: 'Hoy', notifications: today });
    if (yesterday.length > 0) groups.push({ title: 'Ayer', notifications: yesterday });
    if (thisWeek.length > 0) groups.push({ title: 'Esta semana', notifications: thisWeek });
    if (older.length > 0) groups.push({ title: 'Anteriores', notifications: older });

    return groups;
  }
}
