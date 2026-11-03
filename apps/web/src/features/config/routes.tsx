import type { RouteObject } from 'react-router';
import { SettingsView } from './SettingsView';

export const navItems = [
  {
    labelKey: 'Configuración', 
    to: '/config', // La ruta será /config
    order: 6, // Aparecerá al final del menú
  },
];

export const routes: RouteObject[] = [
  {
    path: 'config',
    element: <SettingsView />, // Conectamos tu nueva vista aquí
  },
];