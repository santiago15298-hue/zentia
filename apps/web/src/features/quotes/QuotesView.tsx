import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { generateQuotePDF } from './pdfGenerator';

export function QuotesView() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar las cotizaciones
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/quotes`, { credentials: 'omit' })
      .then((res) => res.json())
      .then((data) => {
        setQuotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => console.error('Error al cargar cotizaciones:', error));
  }, []);

  // 2. Cargar los datos de la empresa para el PDF
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/config`, { credentials: 'omit' })
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(console.error);
  }, []);

  // 3. Función para Aprobar Cotización -> Crear Pedido
  const handleApprove = async (quoteId: string) => {
    if (!confirm('¿Estás seguro de aprobar esta cotización y generar un pedido formal?')) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      const res = await fetch(`${apiUrl}/orders/from-quote/${quoteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        alert('¡Cotización aprobada! Pedido generado.');
        window.location.reload(); 
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al aprobar la cotización');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  // 4. Función para generar el mensaje con Inteligencia Artificial
  const handleGenerateAIMessage = async (quote: any) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    alert('Generando mensaje con IA... por favor espera unos segundos.');
    
    try {
      const res = await fetch(`${apiUrl}/ai/generate-followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: quote.customer?.name || 'Cliente',
          quoteNumber: quote.id.substring(0, 8),
          total: quote.total,
          items: quote.items?.map((i: any) => ({ name: i.product?.name })) || []
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        await navigator.clipboard.writeText(data.message);
        
        const phone = quote.customer?.phone;
        // Si el cliente tiene teléfono, abre WhatsApp Web automáticamente
        if (phone) {
          window.open(`https://wa.me/57${phone}?text=${encodeURIComponent(data.message)}`, '_blank');
        } else {
          alert('¡Mensaje copiado al portapapeles!\n\n' + data.message);
        }
      } else {
        alert('Error al generar el mensaje. Revisa que tu API Key de Gemini sea válida y esté en el backend.');
      }
    } catch (err) {
      alert('Error de conexión con la IA');
    }
  };

  return (
    <div className="p-6 h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Cotizaciones</h2>
        <button 
          onClick={() => navigate('/quotes/new')} 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          className="text-sm font-medium transition-colors hover:opacity-90"
        >
          + Nueva Cotización
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Número</th>
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Cargando...</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay cotizaciones registradas.</td></tr>
            ) : (
              quotes.map((quote: any) => (
                <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">#{quote.id?.substring(0, 8) || 'N/A'}</td>
                  <td className="p-4">{quote.customer?.name || 'Cliente'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      quote.status === 'ACCEPTED' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {quote.status || 'DRAFT'}
                    </span>
                  </td>
                  <td className="p-4 font-medium">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(quote.total || 0)}
                  </td>
                  <td className="p-4 flex gap-2 flex-wrap items-center">
                    
                    {/* Botón de Generar PDF */}
                    <button 
                      onClick={() => generateQuotePDF(quote, company)}
                      style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      className="hover:opacity-90 transition-opacity"
                    >
                      PDF
                    </button>
                    
                    {/* Botón de Aprobar (Solo si NO está aceptada) */}
                    {quote.status !== 'ACCEPTED' && (
                      <button 
                        onClick={() => handleApprove(quote.id)}
                        style={{ backgroundColor: '#f59e0b', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        className="hover:opacity-90 transition-opacity"
                      >
                        Aprobar
                      </button>
                    )}

                    {/* Botón Mágico de IA */}
                    <button 
                      onClick={() => handleGenerateAIMessage(quote)}
                      style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      className="hover:opacity-90 transition-opacity"
                    >
                      ✨ Mensaje IA
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