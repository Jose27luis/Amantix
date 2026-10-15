import { Routes } from '@angular/router';
import { adminGuard, adminMatch, authGuard, clientGuard, clientMatch, guestGuard, passwordGuard } from './core/panel.guards';

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
        canMatch: [clientMatch],
        canActivate: [passwordGuard],
        title: 'Inicio · Panel Amantix',
        loadComponent: () => import('./pages/client-home/client-home.component').then((m) => m.ClientHomeComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        canMatch: [adminMatch],
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
        path: 'companies',
        canActivate: [passwordGuard, adminGuard],
        title: 'Clientes · Panel Amantix',
        loadComponent: () => import('./pages/companies/companies.component').then((m) => m.CompaniesComponent),
      },
      {
        path: 'companies/:id',
        canActivate: [passwordGuard, adminGuard],
        title: 'Cliente · Panel Amantix',
        loadComponent: () => import('./pages/company-detail/company-detail.component').then((m) => m.CompanyDetailComponent),
      },
      {
        path: 'tickets',
        canActivate: [passwordGuard],
        title: 'Soporte · Panel Amantix',
        loadComponent: () => import('./pages/tickets/tickets.component').then((m) => m.TicketsComponent),
      },
      {
        path: 'tickets/new',
        canActivate: [passwordGuard, clientGuard],
        title: 'Nuevo ticket · Panel Amantix',
        loadComponent: () => import('./pages/ticket-new/ticket-new.component').then((m) => m.TicketNewComponent),
      },
      {
        path: 'tickets/:id',
        canActivate: [passwordGuard],
        title: 'Ticket · Panel Amantix',
        loadComponent: () => import('./pages/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent),
      },
      {
        path: 'news',
        canActivate: [passwordGuard, adminGuard],
        title: 'Noticias · Panel Amantix',
        loadComponent: () => import('./pages/news-list/news-list.component').then((m) => m.NewsListComponent),
      },
      {
        path: 'news/new',
        canActivate: [passwordGuard, adminGuard],
        title: 'Nueva noticia · Panel Amantix',
        loadComponent: () => import('./pages/news-editor/news-editor.component').then((m) => m.NewsEditorComponent),
      },
      {
        path: 'news/:id',
        canActivate: [passwordGuard, adminGuard],
        title: 'Noticia · Panel Amantix',
        loadComponent: () => import('./pages/news-editor/news-editor.component').then((m) => m.NewsEditorComponent),
      },
      {
        path: 'site-images',
        canActivate: [passwordGuard, adminGuard],
        title: 'Imágenes del sitio · Panel Amantix',
        loadComponent: () => import('./pages/site-images/site-images.component').then((m) => m.SiteImagesComponent),
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
