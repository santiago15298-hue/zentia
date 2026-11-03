import { useEffect, useState } from 'react';

export function ConfigView() {
  const [config, setConfig] = useState({
    id: '',
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/config`, { credentials: 'omit' })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setConfig({
            id: data.id || '',
            name: data.name || '',
            nit: data.nit || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            logoUrl: data.logoUrl || ''
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando configuración:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/config/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(config)
      });

      if (res.ok) {
        alert('¡Configuración actualizada con éxito!');
      } else {
        alert('Error al guardar la configuración');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando configuración...</div>;

  return (
    <div className="p-6 h-full w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Configuración de Empresa</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa *</label>
            <input 
              type="text" required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={config.name}
              onChange={e => setConfig({...config, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIT / Documento *</label>
            <input 
              type="text" required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={config.nit}
              onChange={e => setConfig({...config, nit: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
            <input 
              type="text" required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={config.address}
              onChange={e => setConfig({...config, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input 
              type="text" required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={config.phone}
              onChange={e => setConfig({...config, phone: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
            <input 
              type="email" required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={config.email}
              onChange={e => setConfig({...config, email: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={saving}
            style={{ padding: '10px 20px', backgroundColor: saving ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}