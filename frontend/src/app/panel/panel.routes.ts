import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, passwordGuard } from './core/panel.guards';

export const PANEL_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · Panel Amantix',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/panel-layout.component').then((m) => m.PanelLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [passwordGuard, adminGuard],
        title: 'Dashboard · Panel Amantix',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'leads',
        canActivate: [passwordGuard, adminGuard],
        title: 'Leads · Panel Amantix',
        loadComponent: () => import('./pages/leads/leads.component').then((m) => m.LeadsComponent),
      },
      {
        path: 'leads/:id',
        canActivate: [passwordGuard, adminGuard],
        title: 'Lead · Panel Amantix',
        loadComponent: () => import('./pages/lead-detail/lead-detail.component').then((m) => m.LeadDetailComponent),
      },
      {
        path: 'users',
        canActivate: [passwordGuard, adminGuard],
        title: 'Usuarios · Panel Amantix',
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'profile',
        title: 'Mi perfil · Panel Amantix',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
