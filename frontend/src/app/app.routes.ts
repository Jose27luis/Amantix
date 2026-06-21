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
    path: '**',
    redirectTo: '',
  },
];
