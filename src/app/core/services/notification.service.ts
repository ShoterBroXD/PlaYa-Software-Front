import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Notification, 
  NotificationRequest, 
  NotificationPreferences,
  NotificationCategory 
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Signals para estado reactivo
  private notificationsSignal = signal<Notification[]>([]);
  private unreadCountSignal = signal<number>(0);
  private loadingSignal = signal<boolean>(false);
  
  // Computed signals
  notifications = computed(() => this.notificationsSignal());
  unreadCount = computed(() => this.unreadCountSignal());
  loading = computed(() => this.loadingSignal());
  
  // BehaviorSubject para compatibilidad con observables
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Extraer userId del token JWT
   */
  private getUserIdFromToken(token: string | null): number | null {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtener todas las notificaciones del usuario
   */
  getUserNotifications(unreadOnly: boolean = false): Observable<Notification[]> {
    this.loadingSignal.set(true);
    
    const params: Record<string, string> = {};
    if (unreadOnly) {
      params['unreadOnly'] = 'true';
    }
    
    return this.http.get<Notification[]>(this.apiUrl, {
      params
    }).pipe(
      tap(notifications => {
        this.notificationsSignal.set(notifications);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${userId}/count`).pipe(
      tap(count => this.unreadCountSignal.set(count))
    );
  }

  /**
   * Obtener solo notificaciones no leídas
   */
  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${userId}/unread`);
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    ).pipe(
      tap(() => {
        // Actualizar el estado local
        const notifications = this.notificationsSignal();
        const updatedNotifications = notifications.map(n => 
          n.idNotification === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSignal.set(updatedNotifications);
        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount(updatedNotifications);
      })
    );
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    const notifications = this.notificationsSignal();
    const unreadNotifications = notifications.filter(n => !n.read);
    
    unreadNotifications.forEach(notification => {
      this.markAsRead(notification.idNotification).subscribe({
        error: (err) => console.error('Error al marcar como leída:', err)
      });
    });
  }

  /**
   * Eliminar notificación
   */
  deleteNotification(notificationId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        // Actualizar el estado local
        const notifications = this.notificationsSignal();
        const updatedNotifications = notifications.filter(
          n => n.idNotification !== notificationId
        );
        this.notificationsSignal.set(updatedNotifications);
        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount(updatedNotifications);
      })
    );
  }

  /**
   * Crear notificación (admin/sistema)
   */
  createNotification(request: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, request);
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  updatePreferences(preferences: NotificationPreferences): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/preferences/edit`,
      preferences
    );
  }

  /**
   * Toggle general de notificaciones
   */
  toggleNotifications(): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/preferences`,
      {}
    );
  }

  /**
   * Actualizar contador de no leídas localmente
   */
  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter(n => !n.read).length;
    this.unreadCountSignal.set(count);
  }

  /**
   * Iniciar polling para actualizar notificaciones cada X segundos
   */
  startPolling(intervalMs: number = 30000): Observable<Notification[]> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getUserNotifications())
    );
  }

  /**
   * Limpiar todas las notificaciones (solo local)
   */
  clearNotifications(): void {
    this.notificationsSignal.set([]);
    this.notificationsSubject.next([]);
    this.unreadCountSignal.set(0);
  }
}
