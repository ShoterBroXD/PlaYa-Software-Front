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

  const skipAuthHeader = [
    '/auth/login',
    '/auth/register',
    '/users/password/request',
    '/users/password/reset'
  ];

  const shouldSkip = skipAuthHeader.some((endpoint) => req.url.includes(endpoint));

  // Si hay token, agregar Authorization header
  if (token && !shouldSkip) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
