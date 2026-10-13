import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => '',
});

export const apiOriginInterceptor: HttpInterceptorFn = (request, next) => {
  const origen = inject(API_ORIGIN);

  if (origen === '' || !request.url.startsWith('/api/')) {
    return next(request);
  }

  return next(request.clone({ url: origen + request.url }));
};
