import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { API_ORIGIN } from './core/api-origin';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), { provide: API_ORIGIN, useValue: 'http://127.0.0.1:8090' }],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
