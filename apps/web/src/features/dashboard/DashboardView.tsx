import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function DashboardView() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    quotes: 0,
    revenue: 0,
    recentQuotes: [] as any[]
  });
  const [totalVendido, setTotalVendido] = useState(0);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GUARDIA DE SEGURIDAD: Expulsa a los Vendedores
  // ==========================================
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('zentia_user');
      const role = userStr ? JSON.parse(userStr)?.role : 'SELLER';
      
      if (role === 'SELLER') {
        navigate('/quotes', { replace: true });
      }
    } catch (error) {
      console.error("Error leyendo usuario", error);
    }
  }, [navigate]);

  // Carga de datos original
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    fetch(`${apiUrl}/dashboard/stats`, { credentials: 'omit' })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch(`${apiUrl}/orders`, { credentials: 'omit' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const ventasReales = data.reduce((sum, order) => sum + (order.total || 0), 0);
          setTotalVendido(ventasReales);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Cargando métricas...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Resumen del Negocio</h2>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tarjeta de Ingresos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-8 border-l-green-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-100 rounded-full opacity-50"></div>
          <p className="text-sm font-bold text-green-600 mb-1 tracking-wide uppercase">Ingresos Reales</p>
          <p className="text-3xl font-black text-gray-900 mt-2">
            $ {totalVendido.toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-gray-500 mt-2">Suma de pedidos confirmados</p>
        </div>

        {/* Tarjeta de Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-8 border-l-purple-500 flex flex-col justify-center">
          <p className="text-sm font-bold text-purple-600 mb-1 tracking-wide uppercase">Clientes</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.customers}</p>
          <p className="text-xs text-gray-400 mt-2">Registrados en el sistema</p>
        </div>

        {/* Tarjeta de Productos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-8 border-l-orange-500 flex flex-col justify-center">
          <p className="text-sm font-bold text-orange-600 mb-1 tracking-wide uppercase">Productos</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.products}</p>
          <p className="text-xs text-gray-400 mt-2">Catálogo activo</p>
        </div>

      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-medium text-gray-700">Últimas Cotizaciones</h3>
          <button onClick={() => navigate('/quotes')} className="text-sm text-blue-600 hover:underline">
            Ver todas
          </button>
        </div>
        <div className="p-0">
          {stats.recentQuotes.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">Aún no hay actividad reciente.</p>
          ) : (
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {stats.recentQuotes.map((quote: any) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-blue-600">#{quote.id.substring(0,8)}</td>
                    <td className="p-4 text-sm text-gray-600">{quote.customer?.name}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-medium text-right text-gray-900">
                      $ {quote.total.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}