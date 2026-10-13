import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from './session.service';
import { Rol, Usuario } from '../models/panel.models';

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
  return inject(SessionService).esAdministrador() ? true : inject(Router).createUrlTree(['/panel']);
};

export const clientGuard: CanActivateFn = () => {
  return inject(SessionService).usuario()?.rol === 'cliente' ? true : inject(Router).createUrlTree(['/panel']);
};

function coincideRol(rol: Rol, enServidor: boolean): CanMatchFn {
  return () => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return enServidor;
    }

    return inject(SessionService)
      .cargar()
      .pipe(map((usuario: Usuario | null): boolean => usuario === null ? enServidor : usuario.rol === rol));
  };
}

export const adminMatch: CanMatchFn = coincideRol('administrador', true);

export const clientMatch: CanMatchFn = coincideRol('cliente', false);

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
