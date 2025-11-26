/**
 * Enumeración de categorías de notificaciones (debe coincidir con backend)
 */
export enum NotificationCategory {
  FOLLOWER = 'FOLLOWER',
  COMMENT = 'COMMENT',
  SYSTEM = 'SYSTEM',
  NEW_RELEASE = 'NEW_RELEASE'
}

/**
 * Interfaz para notificaciones
 */
export interface Notification {
  idNotification: number;
  content: string;
  read: boolean;
  date: string; // ISO string format
  type: NotificationCategory;
}

/**
 * Interfaz para crear notificaciones
 */
export interface NotificationRequest {
  idUser: number;
  content: string;
  type: NotificationCategory;
}

/**
 * Interfaz para preferencias de notificaciones
 */
export interface NotificationPreferences {
  enableComments: boolean;
  enableSystems: boolean;
  enableNewReleases: boolean;
  enableFollowers: boolean;
}
