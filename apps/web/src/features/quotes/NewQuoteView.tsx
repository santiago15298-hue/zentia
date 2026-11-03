import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// Definimos la estructura exacta para TypeScript
interface QuoteItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export function NewQuoteView() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [customerId, setCustomerId] = useState('');
  // Aplicamos la interfaz aquí para que TS no se queje
  const [items, setItems] = useState<QuoteItem[]>([{ productId: '', quantity: 1, unitPrice: 0, subtotal: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    fetch(`${apiUrl}/customers`).then(res => res.json()).then(data => {
      setCustomers(Array.isArray(data) ? data : []);
      if (data.length > 0) setCustomerId(data[0].id);
    }).catch(console.error);
    
    fetch(`${apiUrl}/products`).then(res => res.json()).then(data => {
      setProducts(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  const handleProductChange = (index: number, pId: string) => {
    const product = products.find(p => p.id === pId);
    const newItems = [...items];
    
    // Verificación de seguridad para TypeScript
    if (newItems[index] !== undefined) {
      newItems[index] = {
        ...newItems[index],
        productId: pId,
        unitPrice: product ? product.price : 0,
        subtotal: newItems[index].quantity * (product ? product.price : 0)
      };
      setItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    
    // Verificación de seguridad para TypeScript
    if (newItems[index] !== undefined) {
      newItems[index] = {
        ...newItems[index],
        quantity: qty,
        subtotal: qty * newItems[index].unitPrice
      };
      setItems(newItems);
    }
  };

  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0, subtotal: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.some(i => !i.productId)) {
      alert("Selecciona un cliente y al menos un producto por fila.");
      return;
    }
    
    setSaving(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, items, total })
      });
      
      if (res.ok) {
        navigate('/quotes');
      } else {
        const errorData = await res.json();
        console.error("Detalle del error:", errorData);
        alert('Error al guardar la cotización. Revisa la consola.');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/quotes')} className="text-gray-500 hover:text-blue-600">← Volver</button>
        <h2 className="text-2xl font-semibold text-gray-800">Crear Nueva Cotización</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Cliente *</label>
          <select 
            required
            className="w-full border border-gray-300 rounded-md p-2"
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
          >
            <option value="">-- Selecciona un cliente --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.document ? `(${c.document})` : ''}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Productos / Servicios</h3>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-end mb-3 pb-3 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Producto</label>
                <select 
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={item.productId}
                  onChange={e => handleProductChange(index, e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - $ {p.price.toLocaleString('es-CO')}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                <input 
                  type="number" min="1" required
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={item.quantity}
                  onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="w-32">
                <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-700 font-medium">
                  $ {item.subtotal.toLocaleString('es-CO')}
                </div>
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                  X
                </button>
              )}
            </div>
          ))}
          
          <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium hover:underline mt-2">
            + Agregar otra fila
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 mb-6">
          <div className="text-xl">
            <span className="text-gray-500 mr-4">Total:</span>
            <span className="font-bold text-gray-900">$ {total.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" disabled={saving}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {saving ? 'Guardando...' : 'Guardar Cotización'}
          </button>
        </div>
      </form>
    </div>
  );
}