// Halaman Login
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      alert('Login gagal. Silakan daftar jika belum memiliki akun.');
    }
  };

  const handleRegister = async () => {
    if (!username || !password) return alert('Isi username dan password');
    try {
      await api.post('/register', { username, password });
      alert('Registrasi berhasil, silakan tekan tombol Login');
    } catch (error) {
      alert('Registrasi gagal, username mungkin sudah dipakai');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">LinkIT Mini App</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-3 font-semibold hover:bg-blue-700 transition">
            Login
          </button>
          <button type="button" onClick={handleRegister} className="w-full bg-green-500 text-white p-2 rounded font-semibold hover:bg-green-600 transition">
            Register Akun Baru
          </button>
        </form>
      </div>
    </div>
  );
}