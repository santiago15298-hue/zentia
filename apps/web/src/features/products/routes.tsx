import type { RouteObject } from 'react-router';
import { ProductsView } from './ProductsView';
import { ProductForm } from './ProductForm'; // Importamos el formulario

export const navItems = [
  { labelKey: 'Productos', to: '/products', order: 4 },
];

export const routes: RouteObject[] = [
  { path: 'products', element: <ProductsView /> },
  { path: 'products/new', element: <ProductForm /> }, // Registramos la nueva ruta
];