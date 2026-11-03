import type { RouteObject } from 'react-router';
import { CustomersView } from './CustomersView';
import { CustomerForm } from './CustomerForm'; // Importamos el formulario

export const navItems = [
  { labelKey: 'Clientes', to: '/customers', order: 3 },
];

export const routes: RouteObject[] = [
  { path: 'customers', element: <CustomersView /> },
  { path: 'customers/new', element: <CustomerForm /> }, // Registramos la nueva ruta
];