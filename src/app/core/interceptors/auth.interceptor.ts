import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Función para decodificar JWT
  const decodeToken = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Si hay token, agregar Authorization header
  if (token) {
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`,
    };

    // Agregar idUser solo para rutas de notificaciones y playlists
    if (req.url.includes('/notifications') || req.url.includes('/playlists')) {
      const payload = decodeToken(token);
      if (payload?.userId) {
        headers['idUser'] = payload.userId.toString();
      }
    }

    const clonedRequest = req.clone({
      setHeaders: headers,
    });
    return next(clonedRequest);
  }

  return next(req);
};
