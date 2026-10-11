import { Routes } from '@angular/router';
import { VentasPorCategoria } from './pages/ventas-categoria/ventas-por-categoria';

export const REPORTES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ventas-por-categoria' },
  { path: 'ventas-por-categoria', component: VentasPorCategoria, title: 'Ventas por categoría' },
];
