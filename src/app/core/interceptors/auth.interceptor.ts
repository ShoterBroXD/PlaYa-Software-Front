import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Cloudinary uploads do not accept custom Authorization headers
  if (req.url.includes('api.cloudinary.com')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay token, agregar Authorization header
  if (token) {
    console.log('Auth Interceptor - Adding token to request:', req.url);
    console.log('Token exists:', !!token);
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  console.warn('Auth Interceptor - No token found for request:', req.url);
  return next(req);
};
