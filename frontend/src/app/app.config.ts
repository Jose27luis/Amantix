import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from './panel/core/auth.interceptor';
import { apiOriginInterceptor } from './core/api-origin';
import { ParamReuseStrategy } from './core/param-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: RouteReuseStrategy, useClass: ParamReuseStrategy },
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiOriginInterceptor])),
  ],
};
