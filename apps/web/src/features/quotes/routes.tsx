import type { RouteObject } from 'react-router';
import { QuotesView } from './QuotesView';
import { NewQuoteView } from './NewQuoteView';

export const navItems = [
  { labelKey: 'Cotizaciones', to: '/quotes', order: 1 }
];

export const routes: RouteObject[] = [
  { path: 'quotes', element: <QuotesView /> },
  { path: 'quotes/new', element: <NewQuoteView /> } // <-- Ruta agregada
];