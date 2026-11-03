import { Navigate, Outlet } from 'react-router';

export function ProtectedRoute() {
  // Verificamos si el usuario tiene el pase de entrada
  const token = localStorage.getItem('zentia_token');
  
  // Si tiene token, lo dejamos ver la página. Si no, lo devolvemos al login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}