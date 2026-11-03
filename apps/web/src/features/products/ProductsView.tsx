import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function ProductsView() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/products`, { credentials: 'omit' })
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar productos:', error);
        setLoading(false);
      });
  }, []);

  // Función para actualizar el stock directamente desde la tabla
  const handleUpdateStock = async (product: any) => {
    const newStock = window.prompt(`¿Cuál es el nuevo stock para "${product.name}"?`, product.stock || '0');
    
    // Si el usuario cancela o deja en blanco, no hacemos nada
    if (newStock === null || newStock.trim() === '') return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(newStock) })
      });
      
      if (res.ok) {
        alert('Stock actualizado correctamente');
        window.location.reload(); 
      } else {
        alert('Error al actualizar el stock en la base de datos');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="p-6 h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Inventario</h2>
        <button 
          onClick={() => navigate('/products/new')} 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          className="text-sm font-medium hover:opacity-90"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Nombre del Producto</th>
              <th className="p-4 font-medium">Precio Unitario</th>
              <th className="p-4 font-medium">Stock Disponible</th> {/* Nueva columna */}
              <th className="p-4 font-medium">Fecha de Registro</th>
              <th className="p-4 font-medium">Acciones</th> {/* Nueva columna */}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Cargando...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay productos registrados en el inventario.</td></tr>
            ) : (
              products.map((product: any) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.price || 0)}
                  </td>
                  
                  {/* Celda del Stock */}
                  <td className="p-4">
                    <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock || 0} und.
                    </span>
                  </td>

                  <td className="p-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                  
                  {/* Celda de Acciones con el botón */}
                  <td className="p-4">
                    <button 
                      onClick={() => handleUpdateStock(product)}
                      style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      className="hover:opacity-90 transition-opacity"
                    >
                      Ajustar Stock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}