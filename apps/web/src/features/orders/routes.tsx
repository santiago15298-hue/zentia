import type { RouteObject } from 'react-router';
import { OrdersView } from './OrdersView';
import { OrderForm } from './OrderForm';

export const navItems = [
  { labelKey: 'Pedidos', to: '/orders', order: 5 },
];

export const routes: RouteObject[] = [
  { path: 'orders', element: <OrdersView /> },
  { path: 'orders/new', element: <OrderForm /> },
];