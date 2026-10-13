import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from './session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const sesion = inject(SessionService);
  const router = inject(Router);
  const token = sesion.token();

  const solicitud =
    token && request.url.startsWith('/api/')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
      : request.clone({ setHeaders: { Accept: 'application/json' } });

  return next(solicitud).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = request.url === '/api/auth/login';

      if (error.status === 401 && token && !esLogin) {
        sesion.limpiar();
        router.navigate(['/panel/login']);
      }

      if (error.status === 403 && sesion.usuario()?.debe_cambiar_password) {
        router.navigate(['/panel/profile']);
      }

      return throwError(() => error);
    }),
  );
};
