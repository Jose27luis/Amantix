export type RedSocial = 'facebook' | 'tiktok';

export interface PerfilSocial {
  readonly red: RedSocial;
  readonly nombre: string;
  readonly usuario: string;
  readonly url: string;
  readonly llamado: string;
}

export const REDES_SOCIALES: readonly PerfilSocial[] = [
  {
    red: 'facebook',
    nombre: 'Facebook',
    usuario: '@Factix26',
    url: 'https://www.facebook.com/Factix26',
    llamado: 'Síguenos en Facebook',
  },
];
