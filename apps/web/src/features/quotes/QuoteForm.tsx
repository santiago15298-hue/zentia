import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function QuoteForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/quotes/form-data`)
      .then(res => res.json())
      .then(data => {
        setCustomers(data.customers);
        setProducts(data.products);
        if (data.customers.length > 0) setSelectedCustomer(data.customers[0].id);
        if (data.products.length > 0) setSelectedProduct(data.products[0].id);
      })
      .catch(error => console.error('Error cargando datos:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p: any) => p.id === selectedProduct) as any;
    
    const payload = {
      customerId: selectedCustomer,
      items: [{
        productId: selectedProduct,
        quantity: Number(quantity),
        unitPrice: product.price // Tomamos el precio actual del producto
      }]
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const res = await fetch(`${apiUrl}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      navigate('/quotes'); // Volvemos a la tabla si es exitoso
    } else {
      alert('Error al guardar la cotización. Revisa la consola.');
    }
  };

  return (
    <div className="p-6 h-full w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Crear Cotización</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select 
            className="w-full border border-gray-300 rounded-md p-2"
            value={selectedCustomer} 
            onChange={e => setSelectedCustomer(e.target.value)}
            required
          >
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2"
              value={selectedProduct} 
              onChange={e => setSelectedProduct(e.target.value)}
              required
            >
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input 
              type="number" min="1"
              className="w-full border border-gray-300 rounded-md p-2"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
  type="button" 
  onClick={() => navigate('/quotes')} 
  style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', color: '#333', backgroundColor: 'transparent', cursor: 'pointer' }}
>
  Cancelar
</button>
<button 
  type="submit" 
  style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
>
  Guardar
</button>
        </div>
      </form>
    </div>
  );
}