import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function OrderForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    total: ''
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // Cargamos los clientes para llenar el selector automáticamente
    fetch(`${apiUrl}/customers`, { credentials: 'omit' })
      .then(res => res.json())
      .then(data => {
        const customersList = Array.isArray(data) ? data : [];
        setCustomers(customersList);
        if (customersList.length > 0) {
          setFormData(prev => ({ ...prev, customerId: customersList[0].id }));
        }
      })
      .catch(err => console.error('Error cargando clientes:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({
          customerId: formData.customerId,
          total: Number(formData.total)
        })
      });

      if (res.ok) {
        navigate('/orders');
      } else {
        const errorData = await res.json();
        alert(`Error al guardar: ${errorData.detalles || errorData.error}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-6 h-full w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Crear Nuevo Pedido</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select 
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.customerId}
            onChange={e => setFormData({...formData, customerId: e.target.value})}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">Total de la Venta (COP) *</label>
          <input 
            type="number" 
            required
            min="0"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.total}
            onChange={e => setFormData({...formData, total: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => navigate('/orders')} 
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', color: '#333', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Procesar Pedido
          </button>
        </div>
      </form>
    </div>
  );
}