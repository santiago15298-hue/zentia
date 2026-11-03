import { createBrowserRouter, type RouteObject } from 'react-router';
import * as auth from '../../features/auth';
import * as home from '../../features/home';
import { DashboardView } from '../../features/dashboard/DashboardView';
import { NotFoundPage, PrivateLayout, PublicLayout, SessionLayout } from '../layout';
import type { NavItem } from '../navigation';
import { ProtectedRoute } from './protected-route';
import * as quotes from '../../features/quotes';
import * as customers from '../../features/customers';
import * as products from '../../features/products';
import * as orders from '../../features/orders';
import * as config from '../../features/config';

interface FeatureModule {
  routes: RouteObject[];
  navItems: readonly NavItem[];
  publicRoutes?: RouteObject[];
}

const FEATURES: readonly FeatureModule[] = [home, auth, quotes, customers, products, orders, config];

const navItems = FEATURES.flatMap((feature) => feature.navItems);
const headerEnd = <auth.UserMenu />;

// ==========================================
// FILTRO DE MENÚ SEGURO
// ==========================================
const RoleMenuLayout = () => {
  const userStr = localStorage.getItem('zentia_user');
  const role = userStr ? JSON.parse(userStr)?.role : 'SELLER';

  // Si es Vendedor, le quitamos los botones de Dashboard y Configuración
  const filteredNav = role === 'ADMIN' ? navItems : navItems.filter((item: any) => {
    const ruta = item.to || '';
    return !ruta.includes('dashboard') && !ruta.includes('config');
  });

  return <PrivateLayout navItems={filteredNav} headerEnd={headerEnd} />;
};
// ==========================================

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: FEATURES.flatMap((feature) => feature.publicRoutes ?? []),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleMenuLayout />, // Conectamos el filtro aquí
        children: [
          // Configuramos el Dashboard como la vista por defecto al entrar
          { index: true, element: <DashboardView /> },
          { path: 'dashboard', element: <DashboardView /> },
          ...FEATURES.flatMap((feature) => feature.routes)
        ],
      },
    ],
  },
  {
    element: <SessionLayout navItems={navItems} headerEnd={headerEnd} />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
];

export const router = createBrowserRouter(routes);