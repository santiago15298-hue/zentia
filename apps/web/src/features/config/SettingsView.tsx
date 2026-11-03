import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function SettingsView() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Estados de Empleados ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SELLER');
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- Estados de Empresa ---
  const [company, setCompany] = useState({
    name: 'Zentia ERP',
    nit: '900.000.000-1',
    phone: '+57 300 000 0000',
    address: 'Medellín, Colombia'
  });
  const [companyMsg, setCompanyMsg] = useState('');

  // ==========================================
  // GUARDIA DE SEGURIDAD
  // ==========================================
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('zentia_user');
      const userRole = userStr ? JSON.parse(userStr)?.role : 'SELLER';
      if (userRole === 'SELLER') {
        navigate('/quotes', { replace: true });
      }
    } catch (error) {}
  }, [navigate]);

  // ==========================================
  // CARGA INICIAL
  // ==========================================
  const fetchUsers = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      const res = await fetch(`${apiUrl}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const savedCompany = localStorage.getItem('zentia_company');
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
  }, []);

  // ==========================================
  // FUNCIONES DE EMPLEADOS
  // ==========================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: 'Registrando empleado...', type: 'info' });
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: '¡Empleado registrado con éxito!', type: 'success' });
        setName(''); setEmail(''); setPassword(''); setRole('SELLER');
        fetchUsers();
      } else {
        setMessage({ text: data.error || 'Error al registrar.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error de conexión.', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al empleado ${userName}?`)) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try {
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ text: `Empleado ${userName} eliminado correctamente.`, type: 'success' });
        fetchUsers(); 
      } else {
        setMessage({ text: 'Error al eliminar el empleado.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    }
  };

  // ==========================================
  // FUNCIONES DE EMPRESA
  // ==========================================
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('zentia_company', JSON.stringify(company));
    setCompanyMsg('Datos de la empresa actualizados.');
    setTimeout(() => setCompanyMsg(''), 3000);
  };

  return (
    <div className="p-6 h-full w-full max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Configuración del Sistema</h2>

      {/* ========================================== */}
      {/* SECCIÓN 1: DATOS DE LA EMPRESA             */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-800">Datos de la Empresa</h3>
          {companyMsg && <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">{companyMsg}</span>}
        </div>
        
        <form onSubmit={handleSaveCompany} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
            <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIT / RUT</label>
            <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={company.nit} onChange={e => setCompany({ ...company, nit: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal</label>
            <input type="text" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} required />
          </div>
          <div className="flex items-end">
            {/* BOTÓN 1: GUARDAR CAMBIOS (GRIS OSCURO) */}
            <button 
              type="submit" 
              style={{ backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* ========================================== */}
      {/* SECCIÓN 2: GESTIÓN DE EQUIPO               */}
      {/* ========================================== */}
      <h3 className="text-xl font-bold text-gray-800 pt-2">Gestión de Equipo</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO: Formulario de Registro */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Registrar Nuevo Empleado</h3>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 
              message.type === 'error' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
                value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="empleado@zentia.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de Acceso</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol en el Sistema</label>
              <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 font-medium"
                value={role} onChange={e => setRole(e.target.value)}>
                <option value="SELLER">VENDEDOR (Solo cotiza y vende)</option>
                <option value="ADMIN">ADMINISTRADOR (Control total)</option>
              </select>
            </div>
            
            {/* BOTÓN 2: CREAR CUENTA (AZUL) */}
            <button 
              type="submit" 
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginTop: '16px' }}
            >
              Crear Cuenta
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: Lista de Empleados */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Usuarios Registrados</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-sm text-gray-500">
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Correo</th>
                  <th className="p-4 font-medium">Rol</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">Cargando equipo...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay usuarios registrados.</td></tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{user.name}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-block
                          ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                        `}>
                          {user.role === 'ADMIN' ? '👑 ADMIN' : '💼 VENDEDOR'}
                        </span>
                      </td>
                      <td className="p-4">
                        {/* BOTÓN 3: ELIMINAR (ROJO) */}
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}