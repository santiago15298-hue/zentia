import { useEffect, useState } from 'react';

export function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => console.error('Error al cargar pedidos:', error));
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      const res = await fetch(`${apiUrl}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        window.location.reload(); 
      } else {
        alert('Error al actualizar el estado del pedido.');
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-6 h-full w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Control de Pedidos y Logística</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">N° Pedido</th>
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Acciones (Logística)</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Cargando pedidos...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay pedidos registrados aún.</td></tr>
            ) : (
              orders.map((order: any) => {
                const currentStatus = order.status?.trim().toUpperCase();

                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-purple-600">PED-{order.orderNumber || order.id.substring(0,6)}</td>
                    <td className="p-4">
                      {order.customer?.name || 'Cliente'}
                      <div className="text-xs text-gray-400">Cotización: #{order.quoteId?.substring(0, 8)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-block
                        ${currentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                        ${currentStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                        ${currentStatus === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                      `}>
                        {currentStatus === 'PENDING' ? 'PREPARANDO' : 
                         currentStatus === 'SHIPPED' ? 'EN CAMINO' : 
                         currentStatus === 'DELIVERED' ? 'ENTREGADO' : currentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.total || 0)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {currentStatus === 'PENDING' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <span>📦</span> En Camino
                          </button>
                        )}
                        {currentStatus === 'SHIPPED' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <span>✅</span> Marcar Entregado
                          </button>
                        )}
                        {currentStatus === 'DELIVERED' && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            ✨ Operación Cerrada
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}