import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 401:
              errorMessage = 'No autorizado. Por favor inicia sesión.';
              this.authService.logout();
              break;
            case 403:
              errorMessage = 'No tienes permisos para realizar esta acción.';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado.';
              break;
            case 500:
              errorMessage = 'Error del servidor. Intenta más tarde.';
              break;
            default:
              errorMessage = error.error?.message || errorMessage;
          }
        }

        console.error('Error HTTP:', errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
