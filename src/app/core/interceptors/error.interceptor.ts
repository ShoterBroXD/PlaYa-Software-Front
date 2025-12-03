import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorResponse } from '../models/error.model';

const DEFAULT_ERROR_MESSAGE = 'Ocurrio un error inesperado. Intenta nuevamente.';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendPayload = extractBackendPayload(error.error);
      const errorMessage = resolveErrorMessage(error, backendPayload);

      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }

      // Silenciar logs de consola para errores 403 (Forbidden)
      if (error.status !== 403) {
        console.error('HTTP Error Interceptor', {
          url: req.url,
          status: error.status,
          message: errorMessage,
          response: error.error
        });
      }

      const enhancedError = new HttpErrorResponse({
        error: normalizeErrorBody(error, errorMessage, backendPayload),
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? req.url
      });

      return throwError(() => enhancedError);
    })
  );
};

function resolveErrorMessage(
  error: HttpErrorResponse,
  backendPayload: Partial<ErrorResponse> | null
): string {
  if (error.error instanceof ErrorEvent) {
    return error.error.message || DEFAULT_ERROR_MESSAGE;
  }

  if (error.status === 0) {
    return 'No fue posible comunicarse con el servidor. Verifica tu conexion.';
  }

  const backendMessage = extractBackendMessage(backendPayload);
  return backendMessage || error.statusText || DEFAULT_ERROR_MESSAGE;
}

function extractBackendPayload(payload: unknown): Partial<ErrorResponse> | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload.trim() ? { message: payload } : null;
  }

  if (typeof payload === 'object') {
    return payload as Partial<ErrorResponse>;
  }

  return null;
}

function normalizeErrorBody(
  error: HttpErrorResponse,
  message: string,
  backendPayload: Partial<ErrorResponse> | null
): (ErrorResponse & { details?: unknown }) {
  return {
    message,
    status: backendPayload?.status ?? error.status ?? 0,
    timestamp: backendPayload?.timestamp ?? new Date().toISOString(),
    details: backendPayload ?? error.error ?? null
  };
}

function extractBackendMessage(payload: Partial<ErrorResponse> | null): string | null {
  if (!payload) {
    return null;
  }

  const directMessage = payload.message || (payload as any)?.error || (payload as any)?.detail;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage.trim();
  }

  const responseField = (payload as any)?.response;
  if (typeof responseField === 'string' && responseField.trim()) {
    return responseField.trim();
  }

  if (responseField && typeof responseField === 'object') {
    const stringValues = Object.values(responseField).filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    );
    if (stringValues.length > 0) {
      return stringValues[0];
    }
  }

  return null;
}
