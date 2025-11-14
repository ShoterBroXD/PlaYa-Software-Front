import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private nextId = 0;

  // Exposición read-only de las notificaciones
  readonly notifications$ = this.notifications.asReadonly();

  /**
   * Muestra una notificación de éxito
   */
  success(title: string, message: string, duration = 5000) {
    this.show('success', title, message, duration);
  }

  /**
   * Muestra una notificación de error
   */
  error(title: string, message: string, duration = 7000) {
    this.show('error', title, message, duration);
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(title: string, message: string, duration = 6000) {
    this.show('warning', title, message, duration);
  }

  /**
   * Muestra una notificación informativa
   */
  info(title: string, message: string, duration = 5000) {
    this.show('info', title, message, duration);
  }

  /**
   * Muestra un error HTTP de forma amigable
   */
  showHttpError(status: number, message: string) {
    // Detectar mensajes específicos del backend y personalizarlos
    let customMessage = message;

    // Mensaje amigable para "Access Denied"
    if (message && message.toLowerCase().includes('access denied')) {
      customMessage = 'No tienes los permisos necesarios para acceder a este recurso. Por favor, verifica que tu cuenta tenga los privilegios correctos.';
    }

    const errorMessages: { [key: number]: { title: string; message: string } } = {
      400: {
        title: 'Solicitud incorrecta',
        message: customMessage || 'Los datos enviados no son válidos. Por favor, verifica la información.'
      },
      401: {
        title: 'No autorizado',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      },
      403: {
        title: 'Acceso denegado',
        message: customMessage || 'No tienes permisos para realizar esta acción.'
      },
      404: {
        title: 'No encontrado',
        message: customMessage || 'El recurso solicitado no existe.'
      },
      409: {
        title: 'Conflicto',
        message: customMessage || 'Ya existe un registro con estos datos.'
      },
      500: {
        title: 'Acceso restringido',
        message: customMessage.toLowerCase().includes('access denied')
          ? customMessage
          : 'Ocurrió un problema en el servidor. Por favor, intenta de nuevo más tarde.'
      },
      503: {
        title: 'Servicio no disponible',
        message: 'El servicio no está disponible en este momento. Por favor, intenta más tarde.'
      }
    };

    const errorInfo = errorMessages[status] || {
      title: 'Error',
      message: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    };

    this.error(errorInfo.title, errorInfo.message);
  }

  /**
   * Remueve una notificación
   */
  remove(id: number) {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Limpia todas las notificaciones
   */
  clear() {
    this.notifications.set([]);
  }

  /**
   * Método privado para mostrar notificaciones
   */
  private show(type: Notification['type'], title: string, message: string, duration: number) {
    const notification: Notification = {
      id: this.nextId++,
      type,
      title,
      message,
      duration
    };

    this.notifications.update(notifications => [...notifications, notification]);

    // Auto-remover después del duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }
}
