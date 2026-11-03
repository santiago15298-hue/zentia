import { useState } from 'react';
import { useNavigate } from 'react-router';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('zentia_token', data.token);
        localStorage.setItem('zentia_user', JSON.stringify(data.user));
        navigate('/quotes'); 
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="w-full mt-2">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Zentia ERP</h1>
        <p className="text-gray-500 mt-1">Acceso Exclusivo Autorizado</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center font-medium border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            required
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
          className="hover:opacity-90 transition-opacity"
        >
          Ingresar al Sistema
        </button>
      </form>
    </div>
  );
}