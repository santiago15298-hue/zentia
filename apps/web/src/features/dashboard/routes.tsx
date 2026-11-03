import type { RouteObject } from 'react-router';
import { DashboardView } from './DashboardView';

export const navItems = [
  { labelKey: 'Dashboard', to: '/', order: 0 }
];

export const routes: RouteObject[] = [
  { path: '', element: <DashboardView /> } // La ruta vacía '' significa que es la página de inicio
];