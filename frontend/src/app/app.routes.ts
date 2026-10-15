import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.component').then((m) => m.ProductosComponent),
  },
  {
    path: 'productos/:slug',
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle.component').then((m) => m.ProductoDetalleComponent),
  },
  {
    path: 'planes',
    loadComponent: () => import('./pages/planes/planes.component').then((m) => m.PlanesComponent),
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./pages/nosotros/nosotros.component').then((m) => m.NosotrosComponent),
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.component').then((m) => m.ContactoComponent),
  },
  {
    path: 'gracias',
    loadComponent: () => import('./pages/gracias/gracias.component').then((m) => m.GraciasComponent),
  },
  {
    path: 'soluciones/:slug',
    loadComponent: () => import('./pages/local-landing/local-landing.component').then((m) => m.LocalLandingComponent),
  },
  {
    path: 'noticias',
    loadComponent: () => import('./pages/news/news.component').then((m) => m.NewsComponent),
  },
  {
    path: 'noticias/:slug',
    loadComponent: () => import('./pages/news-detail/news-detail.component').then((m) => m.NewsDetailComponent),
  },
  {
    path: 'panel',
    loadChildren: () => import('./panel/panel.routes').then((m) => m.PANEL_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
