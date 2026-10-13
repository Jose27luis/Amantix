import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from './session.service';
import { Usuario } from '../models/panel.models';

export const authGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return false;
  }

  const sesion = inject(SessionService);
  const router = inject(Router);

  return sesion
    .cargar()
    .pipe(map((usuario: Usuario | null): boolean | UrlTree => (usuario ? true : router.createUrlTree(['/panel/login']))));
};

export const passwordGuard: CanActivateFn = () => {
  const usuario = inject(SessionService).usuario();

  return usuario?.debe_cambiar_password ? inject(Router).createUrlTree(['/panel/profile']) : true;
};

export const adminGuard: CanActivateFn = () => {
  return inject(SessionService).esAdministrador() ? true : inject(Router).createUrlTree(['/panel/profile']);
};

export const guestGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const sesion = inject(SessionService);
  const router = inject(Router);

  return sesion
    .cargar()
    .pipe(map((usuario: Usuario | null): boolean | UrlTree => (usuario ? router.createUrlTree(['/panel']) : true)));
};
