import { useState } from 'react';
import { useNavigate } from 'react-router';

export function CustomerForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/customers'); // Volver a la tabla si hay éxito
      } else {
        const errorData = await res.json();
        alert(`Error al guardar: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-6 h-full w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Crear Nuevo Cliente</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input 
            type="text" 
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad (Opcional)</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.document}
            onChange={e => setFormData({...formData, document: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
  type="button" 
  onClick={() => navigate('/customers')} 
  style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', color: '#333', backgroundColor: 'transparent', cursor: 'pointer' }}
>
  Cancelar
</button>
<button 
  type="submit" 
  style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
>
  Guardar Cliente
</button>
        </div>
      </form>
    </div>
  );
}