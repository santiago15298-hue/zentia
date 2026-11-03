import type { ReactNode } from 'react';
import type { NavItem } from '../navigation';
import { PrivateLayout } from './private-layout';
import { PublicLayout } from './public-layout';

interface SessionLayoutProps {
  navItems: readonly NavItem[];
  headerEnd?: ReactNode;
}

export function SessionLayout({ navItems, headerEnd }: SessionLayoutProps) {
  // Leemos nuestro token real en lugar de la memoria antigua
  const token = localStorage.getItem('zentia_token');
  
  return token ? (
    <PrivateLayout navItems={navItems} headerEnd={headerEnd} />
  ) : (
    <PublicLayout />
  );
}