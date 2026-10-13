import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { RespuestaLogin, Usuario } from '../models/panel.models';

const CLAVE_TOKEN = 'amantix.panel.token';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly tokenActual = signal<string | null>(this.leerToken());
  private readonly usuarioActual = signal<Usuario | null>(null);

  readonly token = this.tokenActual.asReadonly();
  readonly usuario = this.usuarioActual.asReadonly();
  readonly esAdministrador = computed(() => this.usuarioActual()?.rol === 'administrador');

  ingresar(correo: string, password: string): Observable<Usuario> {
    return this.http.post<RespuestaLogin>('/api/auth/login', { correo, password }).pipe(
      tap((respuesta: RespuestaLogin) => {
        this.guardarToken(respuesta.token);
        this.usuarioActual.set(respuesta.usuario);
      }),
      map((respuesta: RespuestaLogin) => respuesta.usuario),
    );
  }

  cargar(): Observable<Usuario | null> {
    const usuario = this.usuarioActual();

    if (usuario) {
      return of(usuario);
    }

    if (!this.tokenActual()) {
      return of(null);
    }

    return this.http.get<Usuario>('/api/auth/me').pipe(
      tap((respuesta: Usuario) => this.usuarioActual.set(respuesta)),
      catchError(() => {
        this.limpiar();
        return of(null);
      }),
    );
  }

  actualizarUsuario(usuario: Usuario): void {
    this.usuarioActual.set(usuario);
  }

  cambiarPassword(passwordActual: string, password: string, confirmacion: string): Observable<Usuario> {
    return this.http
      .put<Usuario>('/api/auth/password', {
        password_actual: passwordActual,
        password,
        password_confirmation: confirmacion,
      })
      .pipe(tap((usuario: Usuario) => this.usuarioActual.set(usuario)));
  }

  salir(): Observable<void> {
    if (!this.tokenActual()) {
      this.limpiar();
      return of(undefined);
    }

    return this.http.post<void>('/api/auth/logout', {}).pipe(
      catchError(() => of(undefined)),
      tap(() => this.limpiar()),
    );
  }

  limpiar(): void {
    this.tokenActual.set(null);
    this.usuarioActual.set(null);

    if (this.esNavegador) {
      try {
        localStorage.removeItem(CLAVE_TOKEN);
      } catch {
        return;
      }
    }
  }

  private guardarToken(token: string): void {
    this.tokenActual.set(token);

    if (this.esNavegador) {
      try {
        localStorage.setItem(CLAVE_TOKEN, token);
      } catch {
        return;
      }
    }
  }

  private leerToken(): string | null {
    if (!this.esNavegador) {
      return null;
    }

    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }
}
