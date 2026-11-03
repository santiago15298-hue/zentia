import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
export function CustomersView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // Hacemos la petición a la nueva ruta que creaste en el backend
    fetch(`${apiUrl}/customers`, { credentials: 'omit' })
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar clientes:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Clientes</h2>
        <button 
  onClick={() => navigate('/customers/new')} 
  style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
  className="text-sm font-medium hover:opacity-90"
>
  + Nuevo Cliente
</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Teléfono</th>
              <th className="p-4 font-medium">Documento</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay clientes registrados.</td></tr>
            ) : (
              customers.map((customer: any) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{customer.name}</td>
                  <td className="p-4">{customer.email || 'N/A'}</td>
                  <td className="p-4">{customer.phone || 'N/A'}</td>
                  <td className="p-4">{customer.document || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}